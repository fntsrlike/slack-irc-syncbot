'use strict';

var _ = require('underscore');
var IRC = require('irc');
var Slacker = require('./slacker');
var IrcMsgEncoder = require('./irc-msg-encoder');

/**
 * IRC Bot for syncing messages from IRC to Slack
 * @param {object} config Bot configuration
 * - server: IRC server
 * - nick: Bot IRC nickname
 * - token: Slack token
 * - channels: List of IRC channels to watch
 * - users: Map of ~login: slack usernames
 */
var Bot = function(config) {
  this.config = _.defaults(config, {

    // Connection
    server: 'irc.freenode.com',
    username: 'slackbot',
    nick: 'slackbot',

    // Map
    channels: {},
    users: {},

    // Flag
    isSilent: false,
    isSystemSilent: true,
    isUsersTracking: true,
    isAutoTildeAdded: false,
    isMapName: true,
    isMapAvatar: true
  });

  // default node-irc options
  // (@see https://github.com/martynsmith/node-irc/blob/0.3.x/lib/irc.js)
  this.irc = {
    userName: this.config.username,
    channels: Object.keys(this.config.channels),
    floodProtection: true
  };
  this.config.ircChannels = _.values(this.config.channels);
  ['floodProtection', 'port', 'debug', 'showErrors', 'autoRejoin',
   'autoConnect', 'secure', 'selfSigned', 'certExpired',
   'floodProtection', 'floodProtectionDelay', 'sasl', 'stripColors',
   'channelPrefixes', 'messageSplit'].forEach(function(opt) {
    if (this.config[opt]) {
      this.irc[opt] = this.config[opt];
    }
  }.bind(this));

  if (this.config.isAutoTildeAdded) {

    // ensure tilde is present if not provided by the user
    Object.keys(this.config.users).forEach(function(username) {
      if (username[0] !== '~') {
        this.config.users['~' + username] = this.config.users[username];
        delete this.config.users[username];
      }
    }.bind(this));
  }
  this._usermap = {
    users: this.config.users || {},
    nicks: {}
  };
  this.client = new IRC.Client(this.config.server, this.config.nick, this.irc);
  this.slacker = new Slacker(config);

  if (config.isUsersTracking) {
    this._trackUsers();
  }

  this._handleErrors();
  return this;
};

/**
 * Whenever an error is provided catch is and let the channel know
 */
Bot.prototype._handleErrors = function() {
  this.client.addListener('error', function(message) {
    var channel = message.args[1];
    var errorMessage = this.mapPronouns(message.args[2]);
    this.systemSpeak(channel, 'I don\'t feel so well because ' + errorMessage);
  }.bind(this));
};

/**
 * Find and track IRC users -> slack user mapping
 */
Bot.prototype._trackUsers = function() {
  var myusername = '~' + this.config.username;

  // On entrance, track all existing names
  this.client.addListener('names', function(channel, nicks) {
    Object.keys(nicks).forEach(function(nick) {
      this.client.whois(nick, function(whois) {
        if (whois.user === myusername) {
          return;
        }
        this._usermap.nicks[nick] = this._usermap.users[whois.user];
      }.bind(this));
    }.bind(this));
    this.systemSpeak(channel, 'I\'m all over you slackers');
  }.bind(this));

  // New user has joined, match him up
  this.client.addListener('join', function(channel, nick, whois) {
    if (whois.user === myusername) {
      return;
    }
    else {
      this._usermap.nicks[nick] = this._usermap.users[whois.user];
      this.systemSpeak(channel, 'i\'m watching you slacker @' +
             this._usermap.nicks[nick]);
    }
  }.bind(this));

  // Existing user has changed nickname
  this.client.addListener('nick', function(oldNick, newNick, channels) {
    if (newNick === this.config.nick) {
      return;
    }
    this._usermap.nicks[newNick] = this._usermap.nicks[oldNick];
    delete this._usermap.nicks[oldNick];
    channels.forEach(function(channel) {
      this.systemSpeak(channel, 'don\'t think you can hide slacker @' +
             this._usermap.nicks[newNick]);
    }.bind(this));
  }.bind(this));
};

/**
 * Handle post and pass it to slack
 */
Bot.prototype.listen = function() {
  this.client.addListener('message', this.sentToSlack.bind(this));
};

Bot.prototype.sentToSlack = function(from, to, message) {
  var
  username = from,
  avatar = this.config.iconUrl,
  avatars = this.config.avatarMap,
  hasAvatar = false;

  if (this.config.isMapName && !!this._usermap.nicks[from]) {
    username = this._usermap.nicks[from];
    hasAvatar = typeof avatars[username] !== 'undefined';
  }

  if (this.config.isMapAvatar && hasAvatar) {
    avatar = avatars[username];
  }

  if (!message.match(/.+url.*:\ \[.+\]/)) {
    this.slacker.send('chat.postMessage', {
      channel: this.config.ircChannels[0],
      text: this.prepareMessage(message),
      username: username,
      icon_url: avatar,
      icon_emoji: this.config.iconEmoji
    });
  }
};

/**
 * Push a message to a channel
 * @param {string} channel IRC channel name
 * @param {string} message Message to push to channel
 */
Bot.prototype.speak = function(channel, message) {
  if (!this.config.isSilent) {
    this.client.say(channel, message);
  }
};

/**
 * Push system message to a channel
 * @param {string} channel IRC channel name
 * @param {string} message Message to push to channel
 */
Bot.prototype.systemSpeak = function(channel, message) {
  if (!this.config.isSystemSilent) {
    this.speak(channel, message);
  }
};

/**
 * Map users with whois to get ~loginname for stability
 * @param {string} message Message to replace IRC user with slack @user
 * @param {array} users User mapping
 * @return {string} Message with slack @users
 */
Bot.prototype.prepareMessage = function(message) {
  return IrcMsgEncoder(message)
    .setChanelMap(this.config.channels)
    .setUserMap(this.config.users)
    .setNickMap(this._usermap.nicks)
    .autoMention().encodeMention().toString();
};

/**
 * Try and map error commands (in third person) to first person
 * so the bot is more personal.
 */
Bot.prototype.mapPronouns = function(message) {
  var map = {
    'you': 'i',
    'you\'re': 'i\'m'
  };
  return message.split(' ').map(function(word) {
    return map[word.toLowerCase()] ? map[word.toLowerCase()] : word;
  }).join(' ');
};

module.exports.Bot = Bot;

'use strict';

var _ = require('underscore'),
  Irc = require('irc'),
  Slacker = require('./slacker'),
  IrcMsgEncoder = require('./irc-msg-encoder');

// IRC Bot for syncing messages from IRC to Slack
var IrcBot = function(config) {
  if (!(this instanceof IrcBot)) {
    return new IrcBot(config);
  }

  this.config = _.defaults(config, {
    server: 'irc.freenode.com', // IRC server
    username: 'slackbot',       // Bot IRC nickname
    nick: 'slackbot',

    channels: {}, // Map of ircChannels : slackChannels
    users: {},    // Map of ircLogin : slackUsernames

    isSilent: false,
    isSystemSilent: true,
    isUsersTracking: true,
    isAutoTildeAdded: false,
    isMapName: true,
    isMapAvatar: true
  });

  this._configureClient();
  this.client = new Irc.Client(this.config.server, this.config.nick, this.irc);
  this.slacker = new Slacker(config);

  if (config.isUsersTracking) {
    this._trackUsers();
  }

  this._handleErrors();
  return this;
};

IrcBot.prototype._configureClient = function() {
  var nodeIrcOptions = [
    'floodProtection', 'port', 'debug', 'showErrors', 'autoRejoin',
    'autoConnect', 'secure', 'selfSigned', 'certExpired',
    'floodProtection', 'floodProtectionDelay', 'sasl', 'stripColors',
    'channelPrefixes', 'messageSplit'
  ];

  this.irc = {
    userName: this.config.username,
    channels: Object.keys(this.config.channels),
    floodProtection: true
  };
  this.config.ircChannels = _.values(this.config.channels);

  this._usermap = {
    users: this.config.users || {},
    nicks: {}
  };

  nodeIrcOptions.forEach(function(opt) {
    if (this.config[opt]) {
      this.irc[opt] = this.config[opt];
    }
  }.bind(this));

  if (this.config.isAutoTildeAdded) {
    this._addTiledePrefix();
  }
};

IrcBot.prototype._addTiledePrefix = function() {
  Object.keys(this.config.users).forEach(function(username) {
    if (username[0] !== '~') {
      this.config.users['~' + username] = this.config.users[username];
      delete this.config.users[username];
    }
  }.bind(this));
};

/**
 * Whenever an error is provided catch is and let the channel know
 */
IrcBot.prototype._handleErrors = function() {
  this.client.addListener('error', function(message) {
    var
    channel = message.args[1],
    errorMessage = this.mapPronouns(message.args[2]);

    this.systemSpeak(channel, 'I don\'t feel so well because ' + errorMessage);
  }.bind(this));
};

/**
 * Find and track IRC users -> slack user mapping
 */
IrcBot.prototype._trackUsers = function() {
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
IrcBot.prototype.listen = function() {
  this.client.addListener('message', this.sentToSlack.bind(this));
};

IrcBot.prototype.sentToSlack = function(from, to, message) {
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
      icon_emoji: this.config.iconEmoji,
      unfurl_links: true
    });
  }
};

/**
 * Push a message to a channel
 * @param {string} channel IRC channel name
 * @param {string} message Message to push to channel
 */
IrcBot.prototype.speak = function(channel, message) {
  if (!this.config.isSilent) {
    this.client.say(channel, message);
  }
};

/**
 * Push system message to a channel
 * @param {string} channel IRC channel name
 * @param {string} message Message to push to channel
 */
IrcBot.prototype.systemSpeak = function(channel, message) {
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
IrcBot.prototype.prepareMessage = function(message) {
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
IrcBot.prototype.mapPronouns = function(message) {
  var map = {
    'you': 'i',
    'you\'re': 'i\'m'
  };
  return message.split(' ').map(function(word) {
    return map[word.toLowerCase()] ? map[word.toLowerCase()] : word;
  }).join(' ');
};

module.exports = IrcBot;

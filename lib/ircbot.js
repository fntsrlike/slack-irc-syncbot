'use strict';

var _ = require('underscore'),
  Irc = require('irc'),
  IrcMsgEncoder = require('./irc-msg-encoder');

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
    isMapName: true,
    isMapAvatar: true
  });

  this._configureClient();
  this.client = new Irc.Client(this.config.server, this.config.nick, this.irc);

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

  nodeIrcOptions.forEach(function(opt) {
    if (this.config[opt]) {
      this.irc[opt] = this.config[opt];
    }
  }.bind(this));
};

IrcBot.prototype._handleErrors = function() {
  this.client.addListener('error', function(message) {
    var
    channel = message.args[1],
    errorMessage = this.mapPronouns(message.args[2]);

    this.systemSpeak(channel, 'I don\'t feel so well because ' + errorMessage);
  }.bind(this));
};

IrcBot.prototype._trackUsers = function() {
  this._trackUserExisting();
  this._trackUserEntering();
  this._trackUserNicking();
};

IrcBot.prototype._trackUserExisting = function() {
  this.client.addListener('names', function(channel, nicks) {
    Object.keys(nicks).forEach(function(nick) {
      var botUsername = '~' + this.config.username;
      this.client.whois(nick, function(whois) {
        if (whois.user === botUsername) {
          return;
        }
        var slackName = this.nameMap.getSlackNameByIrcWhoIs(whois.user);
        this.nameMap.setSlackNameByIrcNick(slackName, nick);
      }.bind(this));
    }.bind(this));
    this.systemSpeak(channel, 'I\'m all over you slackers');
  }.bind(this));
};

IrcBot.prototype._trackUserEntering = function() {
  this.client.addListener('join', function(channel, nick, whois) {
    var botUsername = '~' + this.config.username;
    if (whois.user === botUsername) {
      return;
    }
    else {
      var slackName = this.nameMap.getSlackNameByIrcWhoIs(whois.user);
      this.nameMap.setSlackNameByIrcNick(slackName, nick);
      this.systemSpeak(channel, 'i\'m watching you slacker @' + slackName);
    }
  }.bind(this));
};

IrcBot.prototype._trackUserNicking = function() {
  this.client.addListener('nick', function(oldNick, newNick, channels) {
    if (newNick === this.config.nick) {
      return;
    }
    var slackName = this.nameMap.getSlackNameByIrcNick(oldNick);
    this.nameMap.replaceIrcNick(oldNick, newNick);
    channels.forEach(function(channel) {
      this.systemSpeak(channel, 'don\'t think you can hide slacker @' + slackName);
    }.bind(this));
  }.bind(this));
};

IrcBot.prototype.setSlackBot = function(slackBot) {
  this.slackBot = slackBot;
  return this;
};

IrcBot.prototype.setNameMap = function(nameMap) {
  this.nameMap = nameMap;
  if (this.config.isUsersTracking) {
    this._trackUsers();
  }
  return this;
};

IrcBot.prototype.listen = function() {
  this.client.addListener('message', this.sentToSlack.bind(this));
};

IrcBot.prototype.sentToSlack = function(from, to, message) {
  var
  username = from,
  avatar = this.config.iconUrl,
  avatars = this.config.avatarMap,
  hasAvatar = false,
  isNickExist = !!this.nameMap.getSlackNameByIrcNick(from);

  if (this.config.isMapName && isNickExist) {
    username = this.nameMap.getSlackNameByIrcNick(from);
    hasAvatar = typeof avatars[username] !== 'undefined';
  }

  if (this.config.isMapAvatar && hasAvatar) {
    avatar = avatars[username];
  }

  if (!message.match(/.+url.*:\ \[.+\]/)) {
    this.slackBot.send('chat.postMessage', {
      channel: this.config.ircChannels[0],
      text: this.prepareMessage(message),
      username: username + ' (irc)',
      icon_url: avatar,
      icon_emoji: this.config.iconEmoji
    });
  }
};

IrcBot.prototype.speak = function(channel, message) {
  if (!this.config.isSilent) {
    this.client.say(channel, message);
  }
};

IrcBot.prototype.systemSpeak = function(channel, message) {
  if (!this.config.isSystemSilent) {
    this.speak(channel, message);
  }
};

IrcBot.prototype.prepareMessage = function(message) {
  return IrcMsgEncoder(message)
    .setChanelMap(this.config.channels)
    .setUserMap(this.nameMap.getIrcWhoIsMap())
    .setNickMap(this.nameMap.getIrcNickMap())
    .autoMention().encodeMention().toString();
};

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

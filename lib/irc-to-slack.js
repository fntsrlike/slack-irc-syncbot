'use strict';

var _ = require('underscore');

var IrcMsgEncoder = require('./irc-msg-encoder');

var IrcToSlack = function(config) {
  if (!(this instanceof IrcToSlack)) {
    return new IrcToSlack(config);
  }

  this.config = _.defaults(config, {
    'bannedIRCNicks': [],
    'bannedKeywords': []
  });

  return this;
};

IrcToSlack.prototype._prepareMessage = function(message, type) {
  return IrcMsgEncoder(message, type)
    .setChanelMap(this.ircBot.config.channels)
    .setNickMap(this.nameMap.getIrcNickMap())
    .autoMention().encodeMention().encodeAmpersand().toString();
};

IrcToSlack.prototype._sentToSlack = function(type, from, to, message) {
  var username = from;
  var avatar = this.config.iconUrl;
  var avatars = this.config.avatarMap;
  var hasAvatar = false;
  var isNickExist = !!this.nameMap.getSlackNameByIrcNick(from);
  var bannedKeywords = this.config.bannedKeywords;

  if (_.contains(this.config.bannedIRCNicks, username)) {
    return;
  }

  for (var i=0,  len=bannedKeywords.length; i < len; i++) {
    if (message.toLowerCase().indexOf(bannedKeywords[i].toLowerCase()) > -1) {
      return;
    }
  }

  if (this.config.isMapName && isNickExist) {
    username = this.nameMap.getSlackNameByIrcNick(from);
    hasAvatar = typeof avatars[username] !== 'undefined';
  }

  if (this.config.isMapAvatar && hasAvatar) {
    avatar = avatars[username];
  }

  if (!message.match(/.+url.*:\ \[.+\]/)) {
    this.slackBot.send('chat.postMessage', {
      channel: this.config.channels[to],
      text: this._prepareMessage(message, type),
      username: username + ' (irc)',
      icon_url: avatar,
      icon_emoji: this.config.iconEmoji
    });
  }
};

IrcToSlack.prototype.setIrcBot = function(bot) {
  this.ircBot = bot;
  return this;
};

IrcToSlack.prototype.setSlackBot = function(slackBot) {
  this.slackBot = slackBot;
  return this;
};

IrcToSlack.prototype.setNameMap = function(nameMap) {
  this.nameMap = nameMap;
  return this;
};

IrcToSlack.prototype.listen = function() {
  this.ircBot.addListener('message', this._sentToSlack.bind(this, 'message'));
  this.ircBot.addListener('action', this._sentToSlack.bind(this, 'action'));
};


module.exports = IrcToSlack;

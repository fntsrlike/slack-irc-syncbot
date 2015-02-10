'use strict';

var _ = require('underscore'),
  IrcMsgEncoder = require('./irc-msg-encoder');

var IrcToSlack = function(config) {
  if (!(this instanceof IrcToSlack)) {
    return new IrcToSlack(config);
  }

  this.config = _.defaults(config, {
  });

  return this;
};

IrcToSlack.prototype._prepareMessage = function(message) {
  return IrcMsgEncoder(message)
    .setChanelMap(this.ircBot.config.channels)
    .setUserMap(this.nameMap.getIrcWhoIsMap())
    .setNickMap(this.nameMap.getIrcNickMap())
    .autoMention().encodeMention().encodeAmpersand().toString();
};

IrcToSlack.prototype._sentToSlack = function(from, to, message) {
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
      text: this._prepareMessage(message),
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
  this.ircBot.addListener('message', this._sentToSlack.bind(this));
};


module.exports = IrcToSlack;

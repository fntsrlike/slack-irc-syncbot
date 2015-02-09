'use strict';

var IrcMsgEncoder = function(message) {
  if (!(this instanceof IrcMsgEncoder)) {
    return new IrcMsgEncoder(message);
  }

  this.message = message;
  this.channelMap = {};
  this.userMap = {};
  this.nickMap = {};
};

IrcMsgEncoder.prototype.toString = function() {
  return this.message;
};

IrcMsgEncoder.prototype.setChanelMap = function(map) {
  this.channelMap = map;
  return this;
};

IrcMsgEncoder.prototype.setUserMap = function(map) {
  this.userMap = map;
  return this;
};

IrcMsgEncoder.prototype.setNickMap = function(map) {
  this.nickMap = map;
  return this;
};

// `ircname` -> `@slackname`
IrcMsgEncoder.prototype.autoMention = function() {
  Object.keys(this.nickMap).forEach(function(ircNick) {
    var slackName = this.nickMap[ircNick];
    if (this.message.indexOf(ircNick) >= 0) {
      if (slackName !== undefined) {
        this.message = this.message.replace(new RegExp('@?' + ircNick, 'g'), '@' + slackName);
      }
    }
  }.bind(this));

  return this;
};

// `@username` -> `<@username>`
IrcMsgEncoder.prototype.encodeMention = function() {
  this.message = this.message.replace(/<?@\w+>?/g, function(matched) {
    var username = matched.match(/@(\w+)([ :]?)/)[1];
    return '<@' + username + '>';
  }.bind(this));
  return this;
};

IrcMsgEncoder.prototype.encodeAmpersand = function() {
  this.message = this.message.replace(/&/g, '&amp;');
  return this;
};

module.exports = IrcMsgEncoder;

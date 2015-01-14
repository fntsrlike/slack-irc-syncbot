'use strict';

var IrcMsgEncoder = function(message) {
  if (!(this instanceof IrcMsgEncoder)) {
    return new IrcMsgEncoder(message);
  }

  this.message = message;
  this.channelMap = {};
  this.userMap = {};
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

IrcMsgEncoder.prototype.encodeUser = function() {
  this.message = this.message.replace(/<?@\w+>?/g, function(matched) {
    var
    username = matched.match(/@(\w+)([ :]?)/)[1];
    return '<@' + username + '>';
  }.bind(this));
  return this;
};

module.exports = IrcMsgEncoder;

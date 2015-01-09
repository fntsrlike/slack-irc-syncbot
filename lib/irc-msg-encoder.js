'use strict';

var IrcMsgEncoder = function(message) {
  if (!(this instanceof IrcMsgEncoder)) {
    return new IrcMsgEncoder(message);
  }

  this.message = message;
  this.channelList = {};
  this.userList = {};
};

IrcMsgEncoder.prototype.toString = function() {
  return this.message;
};

IrcMsgEncoder.prototype.setChanelList = function(list) {
  this.channelList = list;
  return this;
};

IrcMsgEncoder.prototype.setUserList = function(list) {
  this.userList = list;
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

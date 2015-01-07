var IRCMsgEncoder = function( message ) {
  if ( !( this instanceof IRCMsgEncoder ) ) {
    return new IRCMsgEncoder( message );
  }

  this.message = message;
  this.channelList = {};
  this.userList = {};
}

IRCMsgEncoder.prototype.toString = function() {
  return this.message;;
}

IRCMsgEncoder.prototype.setChanelList = function( list ) {
  this.channelList = list;
  return this;
}

IRCMsgEncoder.prototype.setUserList = function( list ) {
  this.userList = list;
  return this;
}

IRCMsgEncoder.prototype.encodeUser = function() {
  this.message = this.message.replace( /\<?@\w+\>?/g, function( matched ) {
    var
    username = matched.match( /@(\w+)([ :]?)/ )[1];
    return '<@' + username + '>';
  }.bind( this ) );
  return this;
}

exports = module.exports.IRCMsgEncoder = IRCMsgEncoder;

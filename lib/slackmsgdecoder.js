var SlackMsgDecoder = function( message ) {
  if ( !( this instanceof SlackMsgDecoder ) ) {
    return new SlackMsgDecoder( message );
  }

  this.message = message;
  this.channelList = {};
  this.userList = {};
}

SlackMsgDecoder.prototype.toString = function() {
  return this.message;;
}

SlackMsgDecoder.prototype.setChanelList = function( list ) {
  this.channelList = list;
  return this;
}

SlackMsgDecoder.prototype.setUserList = function( list ) {
  this.userList = list;
  return this;
}

SlackMsgDecoder.prototype.decodeChannel = function() {
  this.message = this.message.replace( /<#C\w{8}>/g, function( matched ) {
    var
    channelId = matched.match( /#(C\w{8})/ )[1],
    list = this.channelList;
    return '#' + list[channelId];
  }.bind(this) );
  return this;
}

SlackMsgDecoder.prototype.decodeUser = function() {
  this.message = this.message.replace( /<@U\w{8}>/g, function( matched ) {
    var
    memberId = matched.match( /@(U\w{8})/ )[1],
    list = this.userList;
    return '@' + list[memberId];
  }.bind(this) );
  return this;
}

SlackMsgDecoder.prototype.decodeURL = function() {
  var rex = /<(https?\:\/\/.+)\|.+>/g;
  this.message = this.message.replace( rex, function( matched, url ) {
    return url.replace( /&amp;/g, '&' );
  }.bind( this ) );
  return this;
}

SlackMsgDecoder.prototype.decodeAngel = function() {
  this.message = this.message.replace( /&lt;/g, '<' ).replace( /&gt;/g, '>' );
  return this;
}

exports = module.exports.SlackMsgDecoder = SlackMsgDecoder;

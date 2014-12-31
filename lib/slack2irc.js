var _ = require( 'underscore' ),
  http = require( 'http' ),
  ircbot = require( './bot' ),
  querystring = require( 'querystring' ),
  request = require( 'request' );

var Slack2IRC = function ( config ) {
  if ( !( this instanceof Slack2IRC ) ) {
    return new Slack2IRC( config );
  }

  this.config = _.defaults( config, {
  } );
};

Slack2IRC.prototype.listen = function() {
  // TODO: Sync both to each other
};

Slack2IRC.prototype._confirmReady = function() {
  // TODO: Make sure if we get list.
};

Slack2IRC.prototype._server = function() {
  // TODO: Create server to listen request from slack
};

Slack2IRC.prototype._requestHandler = function() {
  // TODO: Handle request from slack
};

Slack2IRC.prototype._sentMessage = function() {
  // TODO: Ask slackbot to send message from slack
};

Slack2IRC.prototype._transformMessage = function () {
  // TODO: Transform message from slack type to irc type
};

Slack2IRC.prototype._updateLists = function() {
  // TODO: Get and update user and channel list, then regularly updated.
};

Slack2IRC.prototype._updateUserList = function() {
  // TODO: Update user list
};

Slack2IRC.prototype._updateChannelList = function() {
  // TODO: Update channel list
};

exports = module.exports.Slack2IRC = Slack2IRC;

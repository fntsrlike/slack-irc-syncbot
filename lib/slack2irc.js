var _ = require( 'underscore' ),
  dns = require( 'dns' ),
  http = require( 'http' ),
  ircbot = require( './bot' ),
  querystring = require( 'querystring' ),
  request = require( 'request' );

var Slack2IRC = function ( config ) {
  if ( !( this instanceof Slack2IRC ) ) {
    return new Slack2IRC( config );
  }

  this.confirmCounter = 0;
  this.slackUsers = {};
  this.slackChannels = {};
  this.config = _.defaults( config, {
    initializeTimeoutLimit: 10,
    listUpdatedPeriod: 600
  } );

  this._checkInternetConnected();
  this._updateLists();
};

Slack2IRC.prototype.listen = function() {
  this._confirmReady(function() {
    // TODO: Sync both to each other
  }.bind( this ) );
};

Slack2IRC.prototype._confirmReady = function( callback ) {
  var
  checkingCycle = 0.1,
  isReady = !_.isEmpty( this.getUserList() ),
  isTimeout = this.config.initializeTimeoutLimit < this.confirmCounter;

  this.confirmCounter += checkingCycle;

  if ( isReady ) {
    console.log( 'done!' );
    callback();
  } else if ( isTimeout ) {
    console.log( 'timeout!' );
    process.exit();
  } else {
    process.stdout.write( '.' );
    setTimeout(function() {
      this._confirmReady( callback ) ;
    }.bind( this ), checkingCycle * 1000 );
  }
};

Slack2IRC.prototype._checkInternetConnected = function() {
  dns.resolve( 'www.google.com', function( err ) {
    if ( !_.isNull(err) ) {
      console.log( 'Lost connection of the Internet!' );
      process.exit();
    }
  });
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
  this._updateUserList();
  this._updateChannelList();

  setTimeout(function () {
    this._updateLists()
  }.bind( this ), this.config.listUpdatedPeriod * 1000 );
};

Slack2IRC.prototype._updateUserList = function() {
  request.get( {
      url: 'https://slack.com/api/users.list?token=' + this.config.token
  }, function( error, response, body ) {
    var list, res;
    list = this.getUserList();
    res = JSON.parse( body );
    res.members.map(function( member ) {
      list[member.id] = member.name;
    });
    this.setUserList( list );
  }.bind( this ) );
};

Slack2IRC.prototype._updateChannelList = function() {
  request.get( {
      url: 'https://slack.com/api/channels.list?token=' + this.config.token
  }, function(error, response, body) {
    var list, res;
    list = this.getChannelList();
    res = JSON.parse( body );
    res.channels.map(function( channel ) {
      list[channel.id] = channel.name;
    });
    this.setChannelList( list );
  }.bind( this ) );
};

Slack2IRC.prototype.getUserList = function() {
  return this.slackUsers;
};

Slack2IRC.prototype.getChannelList = function() {
  return this.slackChannels;
};

Slack2IRC.prototype.setUserList = function( list ) {
  this.slackUsers = list;
};

Slack2IRC.prototype.setChannelList = function( list ) {
  this.slackChannels = list;
};

exports = module.exports.Slack2IRC = Slack2IRC;

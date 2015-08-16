'use strict';

var _ = require('underscore');
var http = require('http');
var https = require('https');
var querystring = require('querystring');

var SlackMsgDecoder = require('./slack-msg-decoder');

var SlackToIRC = function(config) {
  if (!(this instanceof SlackToIRC)) {
    return new SlackToIRC(config);
  }

  this.config = _.defaults(config, {
    showSlackChannel: false,
    serverPort: 80,
    httpsServerPort: 443,
    isHttpsConnecttion: false
  });

  // TODO: Check Ports are free or not
  // TODO: Check SSL Keys are exist or not
};

SlackToIRC.prototype.setIrcBot = function(bot) {
  this.ircBot = bot;
  return this;
};

SlackToIRC.prototype.setSlackRes = function(resource) {
  this.slackRes = resource;
  return this;
};

SlackToIRC.prototype.listen = function() {
  this.config.avatarMap = this.slackRes.getAvatarMap();

  this._server().listen(this.config.serverPort);
  console.log('HTTP Web Server running at ' +
              'http://localhost:' + this.config.serverPort + '/');

  if (this.config.isHttpsConnecttion) {
    console.log('this.config.httpsServerPort: ' + this.config.httpsServerPort);
    this._httpsServer().listen(this.config.httpsServerPort);
    console.log('HTTPS Web Server running at ' +
                'https://localhost:' + this.config.httpsServerPort + '/');
  }
  return this;
};

SlackToIRC.prototype._server = function() {
  var server =  http.createServer(function(req, res) {
    if (req.method === 'POST') {
      this._requestHandler(req, res);
    } else {
      res.end('Recieved request (not post).');
    }
  }.bind(this));

  return server;
};

SlackToIRC.prototype._httpsServer = function() {
  var options;
  var server;

  options = {
    key: fs.readFileSync('ssl/key.pem'),
    cert: fs.readFileSync('ssl/cert.pem')
  };

  server = https.createServer(options, function (req, res) {
    if (req.method === 'POST') {
      this._requestHandler(req, res);
    } else {
      res.end('Recieved request (not post).');
    }
  }.bind(this));

  return server;
};

SlackToIRC.prototype._requestHandler = function(req, res) {
  req.on('data', function(data) {
    var payload = querystring.parse(data.toString());
    var isTokenValid = _.contains(this.config.outgoingToken, payload.token);

    if (isTokenValid && payload.user_name !== 'slackbot') {
      this._sentMessage(payload);
      res.end('Done.');
    }
    res.end('Request should not be from slackbot or must have matched token.');
  }.bind(this));
};

SlackToIRC.prototype._sentMessage = function(payload) {
  var message = this._decodeMessage(payload.text);
  var channel = _.invert(this.config.channels)['#' + payload.channel_name];
  var name = payload.user_name;

  if (this.config.showSlackChannel) {
    name = name + '@' + payload.channel_name;
  }
  name = '<' + name + '>: ';
  message = name + message.replace(/\n/g, '\n' + name);

  this.ircBot.speak(channel, message);
};

SlackToIRC.prototype._decodeMessage = function(text) {
  return SlackMsgDecoder(text)
    .setSlackChanelMap(this.slackRes.getChannelMap())
    .setSlackUserMap(this.slackRes.getUserMap())
    .decodeChannel().decodeUser().decodeURL()
    .decodeAngel().encodeAmpersand().toString();
};

module.exports = SlackToIRC;

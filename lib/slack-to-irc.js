'use strict';

var _ = require('underscore'),
  http = require('http'),
  querystring = require('querystring'),
  SlackMsgDecoder = require('./slack-msg-decoder');

var SlackToIRC = function(config) {
  if (!(this instanceof SlackToIRC)) {
    return new SlackToIRC(config);
  }

  this.config = _.defaults(config, {
    showSlackChannel: false,
    serverPort: 80
  });
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
  console.log('Server running at ' +
               'http://localhost:' + this.config.serverPort + '/');
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

SlackToIRC.prototype._requestHandler = function(req, res) {
  req.on('data', function(data) {
    var
      payload = querystring.parse(data.toString()),
      isTokenValid = _.contains(this.config.outgoingToken, payload.token);

    if (isTokenValid && payload.user_name !== 'slackbot') {
      this._sentMessage(payload);
      res.end('Done.');
    }
    res.end('Request should not be from slackbot or must have matched token.');
  }.bind(this));
};

SlackToIRC.prototype._sentMessage = function(payload) {
  var
  message = this._decodeMessage(payload.text),
  channel = _.invert(this.config.channels)['#' + payload.channel_name],
  name = payload.user_name;

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

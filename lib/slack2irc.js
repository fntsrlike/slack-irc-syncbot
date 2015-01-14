'use strict';

var _ = require('underscore'),
  http = require('http'),
  querystring = require('querystring'),
  ircbot = require('./bot'),
  SlackMsgDecoder = require('./slack-msg-decoder');

var Slack2IRC = function(config) {
  if (!(this instanceof Slack2IRC)) {
    return new Slack2IRC(config);
  }

  this.config = _.defaults(config, {
    showSlackChannel: false,
    serverPort: 80
  });
};

Slack2IRC.prototype.listen = function() {
    this.config.avatarMap = this.slackRes.getAvatarMap();
    this.slackbot = new ircbot.Bot(this.config);
    this.slackbot.listen();
    this._server().listen(this.config.serverPort);
    console.log('Server running at ' +
                 'http://localhost:' + this.config.serverPort + '/');
};

Slack2IRC.prototype.setSlackRes = function(resource) {
  this.slackRes = resource;
}

Slack2IRC.prototype._server = function() {
  var server =  http.createServer(function(req, res) {
    if (req.method === 'POST') {
      this._requestHandler(req, res);
    } else {
      res.end('Recieved request (not post).');
    }
  }.bind(this));

  return server;
};

Slack2IRC.prototype._requestHandler = function(req, res) {
  req.on('data', function(data) {
    var payload = querystring.parse(data.toString());
    if (payload.token === this.config.outcomeToken && payload.user_name !== 'slackbot') {
      this._sentMessage(payload);
      res.end('Done.');
    }
    res.end('Request should not be from slackbot or must have matched token.');
  }.bind(this));
};

Slack2IRC.prototype._sentMessage = function(payload) {
  var
  message = this._decodeMessage(payload.text),
  channel = Object.keys(this.config.channels)[0],
  name = payload.user_name;

  if (this.config.showSlackChannel) {
    name = name + '@' + payload.channel_name;
  }
  name = '<' + name + '>: ';
  message = name + message.replace(/\n/g, '\n' + name);

  this.slackbot.speak(channel, message);
};

Slack2IRC.prototype._decodeMessage = function(text) {
  return SlackMsgDecoder(text)
    .setSlackChanelMap(this.slackRes.getChannelMap())
    .setSlackUserMap(this.slackRes.getUserMap())
    .decodeChannel().decodeUser().decodeURL().decodeAngel().toString();
};

module.exports = Slack2IRC;

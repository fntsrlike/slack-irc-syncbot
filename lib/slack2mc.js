'use strict';

var _ = require('underscore'),
  http = require('http'),
  querystring = require('querystring'),
  request = require('request'),
  SlackMsgDecoder = require('./slack-msg-decoder');

var Slack2Mc = function(config) {
  if (!(this instanceof Slack2Mc)) {
    return new Slack2Mc(config);
  }

  this.config = _.defaults(config, {
    showSlackChannel: false,
    serverPort: 80
  });
};

Slack2Mc.prototype.listen = function() {
    this.config.avatarMap = this.slackRes.getAvatarMap();
    this._server().listen(this.config.serverPort);
    console.log('Server running at ' +
                 'http://localhost:' + this.config.serverPort + '/');
};

Slack2Mc.prototype.setSlackRes = function(resource) {
  this.slackRes = resource;
}

Slack2Mc.prototype._server = function() {
  var server =  http.createServer(function(req, res) {
    if (req.method === 'POST') {
      this._requestHandler(req, res);
    } else {
      res.end('Recieved request (not post).');
    }
  }.bind(this));

  return server;
};

Slack2Mc.prototype._requestHandler = function(req, res) {
  req.on('data', function(data) {
    var payload = querystring.parse(data.toString());
    if (payload.token === this.config.outcomeToken && payload.user_name !== 'slackbot') {
      this._sentMessage(payload);
      res.end('Done.');
    }
    res.end('Request should not be from slackbot or must have matched token.');
  }.bind(this));
};

Slack2Mc.prototype._sentMessage = function(payload) {
  var
  message = this._decodeMessage(payload.text),
  name = payload.user_name;

  if (this.config.showSlackChannel) {
    name = name + '@' + payload.channel_name;
  }
  name = '<' + name + '>: ';
  message = name + message.replace(/\n/g, '\n' + name);

  console.log(this.config.minecraftServer);
  console.log(message);

  request.post({
    url: this.config.minecraftServer,
    json: true,
    body: JSON.stringify({
      name: '',
      message: message
    })
  });

};

Slack2Mc.prototype._decodeMessage = function(text) {
  return SlackMsgDecoder(text)
    .setSlackChanelMap(this.slackRes.getChannelMap())
    .setSlackUserMap(this.slackRes.getUserMap())
    .decodeChannel().decodeUser().decodeURL().decodeAngel().toString();
};

module.exports = Slack2Mc;

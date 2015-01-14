'use strict';

var _ = require('underscore'),
  http = require('http'),
  querystring = require('querystring'),
  ircbot = require('./bot'),
  SlackMsgDecoder = require('./slack-msg-decoder'),
  SlackRes = require('./slack-res');

var Slack2IRC = function(config) {
  if (!(this instanceof Slack2IRC)) {
    return new Slack2IRC(config);
  }

  this.confirmCounter = 0;
  this.config = _.defaults(config, {
    initializeTimeoutLimit: 5,
    listUpdatedPeriod: 600,
    showSlackChannel: false,
    serverPort: 80
  });

  this.slackRes = SlackRes(config);
  this.slackRes.update();
};

Slack2IRC.prototype.listen = function() {
  this._confirmReady(function() {
    this.config.avatarMap = this.slackRes.getAvatarMap();
    this.slackbot = new ircbot.Bot(this.config);
    this.slackbot.listen();
    this._server().listen(this.config.serverPort);
    console.log('Server running at ' +
                 'http://localhost:' + this.config.serverPort + '/');
  }.bind(this));
};

Slack2IRC.prototype._confirmReady = function(callback) {
  var
  checkingCycle = 0.1,
  isReady = !_.isEmpty(this.slackRes.getUserMap()),
  isTimeout = this.config.initializeTimeoutLimit < this.confirmCounter;

  this.confirmCounter += checkingCycle;

  if (isReady) {
    console.log('done!');
    callback();
  } else if (isTimeout) {
    console.log('/');
    console.log('Timeout! Please check the Internet status.');
    process.exit();
  } else {
    process.stdout.write('.');
    setTimeout(function() {
      this._confirmReady(callback) ;
    }.bind(this), checkingCycle * 1000);
  }
};

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

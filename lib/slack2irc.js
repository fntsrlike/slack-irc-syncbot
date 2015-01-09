'use strict';

var _ = require('underscore'),
  isOnline = require('is-online'),
  http = require('http'),
  ircbot = require('./bot'),
  SlackMsgDecoder = require('./slack-msg-decoder'),
  querystring = require('querystring'),
  request = require('request');

var Slack2IRC = function(config) {
  if (!(this instanceof Slack2IRC)) {
    return new Slack2IRC(config);
  }

  this.confirmCounter = 0;
  this.slackUsers = {};
  this.slackChannels = {};
  this.config = _.defaults(config, {
    initializeTimeoutLimit: 5,
    listUpdatedPeriod: 600,
    showSlackChannel: false,
    serverPort: 80
  });

  this._updateLists();
};

Slack2IRC.prototype.listen = function() {
  this._confirmReady(function() {
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
  isReady = !_.isEmpty(this.getUserList()),
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
    .setChanelList(this.getChannelList())
    .setUserList(this.getUserList())
    .decodeChannel().decodeUser().decodeURL().decodeAngel().toString();
};

Slack2IRC.prototype._updateLists = function() {
  isOnline(function(err, online) {
    if (online === true) {
      this._updateUserList();
      this._updateChannelList();
    }
  }.bind(this));

  setTimeout(function() {
    this._updateLists();
  }.bind(this), this.config.listUpdatedPeriod * 1000);
};

Slack2IRC.prototype._updateUserList = function() {
  request.get({
      url: 'https://slack.com/api/users.list?token=' + this.config.token
  }, function(error, response, body) {
    var list, res;
    list = this.getUserList();
    res = JSON.parse(body);
    res.members.map(function(member) {
      list[member.id] = member.name;
    });
    this.setUserList(list);
  }.bind(this));
};

Slack2IRC.prototype._updateChannelList = function() {
  request.get({
      url: 'https://slack.com/api/channels.list?token=' + this.config.token
  }, function(error, response, body) {
    var list, res;
    list = this.getChannelList();
    res = JSON.parse(body);
    res.channels.map(function(channel) {
      list[channel.id] = channel.name;
    });
    this.setChannelList(list);
  }.bind(this));
};

Slack2IRC.prototype.getUserList = function() {
  return this.slackUsers;
};

Slack2IRC.prototype.getChannelList = function() {
  return this.slackChannels;
};

Slack2IRC.prototype.setUserList = function(list) {
  this.slackUsers = list;
};

Slack2IRC.prototype.setChannelList = function(list) {
  this.slackChannels = list;
};

module.exports = Slack2IRC;

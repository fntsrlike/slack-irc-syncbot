'use strict';

var _ = require('underscore'),
  IrcBot = require('./ircbot'),
  SlackBot = require('./slackbot'),
  SlackRes = require('./slack-res'),
  Slack2Irc = require('./slack2irc');

var App = function(config) {
  if (!(this instanceof App)) {
    return new App(config);
  }

  this.config = _.defaults(config, {
    initializeTimeoutLimit: 5,
    listUpdatedPeriod: 600
  });

  this.passPrecheck = false;
  this.confirmCounter = 0;

  try {
    this._precheck();
    this.ircBot = IrcBot(this.config);
    this.slackBot = SlackBot(config);
    this.slackRes = SlackRes(config);
    this.slack2Irc = Slack2Irc(config);
    ;
    this.slackRes.update();
  } catch(e) {
    console.log('Error! ' + e);
    process.exit();
  }
};

App.prototype.start = function() {
  this._confirmReady(function() {
    this.slack2Irc
      .setSlackRes(this.slackRes)
      .setIrcBot(this.ircBot)
      .listen();
    this.ircBot
      .setSlackBot(this.slackBot)
      .listen();
  }.bind(this));
};

App.prototype._precheck = function() {
  var requireConfig = [
    'channels', 'username', 'nick', 'token', 'incomeUrl', 'outcomeToken'
  ];

  requireConfig.map(function(index){
    if (_.isEmpty(this.config[index])) {
      throw 'You don\'t have set config: ' + index;
    }
  }.bind(this));
};

App.prototype._confirmReady = function(callback) {
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

module.exports = App;

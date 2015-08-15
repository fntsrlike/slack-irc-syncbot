'use strict';

var _ = require('underscore'),
  IrcBot = require('./ircbot'),
  IrcToSlack = require('./irc-to-slack'),
  SlackBot = require('./slackbot'),
  SlackRes = require('./slack-res'),
  SlackToIrc = require('./slack-to-irc'),
  NameMap = require('./name-map');

var App = function(config) {
  if (!(this instanceof App)) {
    return new App(config);
  }

  this.config = _.defaults(config, {
    initializeTimeoutLimit: 5,
    listUpdatedPeriod: 600
  });

  this.confirmCounter = 0;

  try {
    this._precheck();
    this.nameMap = NameMap(this.config);
    this.ircBot = IrcBot(this.config);
    this.ircToSlack = IrcToSlack(this.config);
    this.slackBot = SlackBot(this.config);
    this.slackRes = SlackRes(this.config);
    this.slackToIrc = SlackToIrc(this.config);

    this.slackRes.update();
  } catch(e) {
    console.log('Error! ' + e);
    process.exit();
  }
};

App.prototype.start = function() {
  this._confirmReady(function() {
    this.slackToIrc
      .setSlackRes(this.slackRes)
      .setIrcBot(this.ircBot)
      .listen();
    this.ircBot.setNameMap(this.nameMap);
    this.ircToSlack
      .setIrcBot(this.ircBot)
      .setSlackBot(this.slackBot)
      .setNameMap(this.nameMap)
      .listen();
  }.bind(this));
};

App.prototype._precheck = function() {
  var requireConfig = [
    'channels', 'username', 'nick', 'token', 'incomeUrl', 'outgoingToken'
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
  isReady = !_.isEmpty(this.slackRes.getUserMap()) && this.nameMap.isChecked,
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

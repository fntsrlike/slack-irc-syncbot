'use strict';

var _ = require('underscore'),
  Slack2Mc = require('./slack2mc'),
  SlackRes = require('./slack-res');

var App = function(config) {
  if (!(this instanceof App)) {
    return new App(config);
  }

  this.config = _.defaults(config, {
    initializeTimeoutLimit: 5,
    listUpdatedPeriod: 600
  });

  this.confirmCounter = 0;
  this.slackRes = SlackRes(config);
  this.Slack2Mc = Slack2Mc(config);

  this.slackRes.update();
};

App.prototype.start = function() {
  this._confirmReady(function() {
    this.Slack2Mc.setSlackRes(this.slackRes);
    this.Slack2Mc.listen();
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

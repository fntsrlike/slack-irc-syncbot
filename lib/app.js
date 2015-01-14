'use strict';

var Slack2Irc = require('./slack2irc');

var App = function(config) {
  if (!(this instanceof App)) {
    return new App(config);
  }

  this.config = config;
  this.slack2Irc = Slack2Irc(config);
};

App.prototype.start = function() {
  this.slack2Irc.listen();
};

module.exports = App;

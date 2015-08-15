'use strict';

var _ = require('underscore'),
  request = require('request');

var SlackBot = function(config) {
  if (!(this instanceof SlackBot)) {
    return new SlackBot(config);
  }

  this.incomeUrl = config.incomeUrl;
  return this;
};

SlackBot.prototype.send = function(method, args) {
  args = _.defaults(args, {
    unfurl_links: true
  });

  request.post({
    url: this.incomeUrl,
    json: true,
    form: { payload: JSON.stringify(args) }
  }, function(error, response, body) {
    if (error || body.error) {
      throw 'Error:' + (error || body.error);
    }
  });
};

module.exports = SlackBot;

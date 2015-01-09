'use strict';

var request = require('request');

/**
 * Slack API wrapper
 * @param {object} config Slacker configuration
 * - token: Slack API token
 */
var Slacker = function(config) {
    this.incomeUrl = config.incomeUrl;
    this.outcomeToken = config.outcomeToken;
    return this;
};

/**
 * Send slack API request
 * @param  {string} method Slack API method
 * @param  {object} args POST arguments to send to Slack
 */
Slacker.prototype.send = function(method, args) {
    args = args || {} ;
    args.username += ' (irc)';
    request.post({
        url: this.incomeUrl,
        json: true,
        form: { payload: JSON.stringify(args) }
    }, function(error, response, body) {
        if (error) {
            console.log('Error:', error || body.error);
        }
    });
};

module.exports = Slacker;

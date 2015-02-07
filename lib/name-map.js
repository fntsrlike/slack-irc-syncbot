'use strict';

var _ = require('underscore'),
  request = require('request');

var NameMap = function(config) {
  if (!(this instanceof NameMap)) {
    return new NameMap(config);
  }

  this.config = _.defaults(config, {
    isAutoTildeAdded: false,
    listUpdatedPeriod: 600,
    users: {}
  });

  this.users = {}; // ircWhoIs : slackName
  this.nicks = {}; // ircNick  : slackName
  this.isChecked = false;
  this._checkMapType();
};

NameMap.prototype._addTiledePrefix = function() {
  Object.keys(this.users).forEach(function(username) {
    if (username[0] !== '~') {
      this.users['~' + username] = this.users[username];
      delete this.users[username];
    }
  }.bind(this));
};

NameMap.prototype._checkMapType = function() {
  if (_.isString(this.config.users)) {
    this._updateMap();
  } else {
    this.users = this.config.users;
    this.isChecked = true;
  }
};

NameMap.prototype._check = function(body) {
  if (typeof body === 'undefined') {
    throw 'Error! Can\'t get resource! Please check the Internet';
  }
};

NameMap.prototype._getUserMapByUrl = function(url) {
  request.get({
    url: url
  }, function(error, response, body) {
    this._check(body);
    this.users = JSON.parse(body);
    this.isChecked = true;

    if (this.config.isAutoTildeAdded) {
      this._addTiledePrefix();
    }
  }.bind(this));
};

NameMap.prototype._updateMap = function() {
  this._getUserMapByUrl(this.config.users);

  setTimeout(function() {
    this._updateMap();
  }.bind(this), this.config.listUpdatedPeriod * 1000);
};

NameMap.prototype.getMap = function() {
  return this.users;
};

module.exports = NameMap;

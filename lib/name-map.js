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

  this.isChecked = false;
  this._checkMapType();
};

NameMap.prototype._checkMapType = function() {
  if (_.isString(this.config.users)) {
    this._updateMap();
  }
  else {
    this.map = this.config.users;
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
    this.map = JSON.parse(body);
    this.isChecked = true;

    if (this.config.isAutoTildeAdded) {
      this._addTiledePrefix();
    }
  }.bind(this));
};

NameMap.prototype.getMap = function() {
  return this.map;
};

NameMap.prototype._updateMap = function() {
  this._getUserMapByUrl(this.config.users);

  setTimeout(function() {
    this._updateMap();
  }.bind(this), this.config.listUpdatedPeriod * 1000);
};


NameMap.prototype._addTiledePrefix = function() {
  Object.keys(this.map).forEach(function(username) {
    if (username[0] !== '~') {
      this.map['~' + username] = this.map[username];
      delete this.map[username];
    }
  }.bind(this));
};

module.exports = NameMap;

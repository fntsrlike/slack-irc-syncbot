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

  this.whoIsMap = {}; // ircWhoIs : slackName
  this.nickMap = {};  // ircNick  : slackName
  this.isChecked = false;
  this._checkMapType();
};

NameMap.prototype._addTiledePrefix = function() {
  Object.keys(this.whoIsMap).forEach(function(username) {
    if (username[0] !== '~') {
      this.whoIsMap['~' + username] = this.whoIsMap[username];
      delete this.whoIsMap[username];
    }
  }.bind(this));
};

NameMap.prototype._checkMapType = function() {
  if (_.isString(this.config.users)) {
    this._updateMap();
  } else {
    this.whoIsMap = this.config.users;
    this.isChecked = true;
  }
};

NameMap.prototype._check = function(body) {
  if (typeof body === 'undefined') {
    throw new Error('Error! Can\'t get resource! Please check the Internet');
  }
};

NameMap.prototype._getUserMapByUrl = function(url) {
  request.get({
    url: url
  }, function(error, response, body) {
    this._check(body);
    this.whoIsMap = JSON.parse(body);
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

NameMap.prototype.getIrcWhoIsMap = function() {
  return this.whoIsMap;
};

NameMap.prototype.getIrcNickMap = function() {
  return this.whoIsMap;
};

NameMap.prototype.getSlackNameByIrcNick = function(ircNick) {
  return this.nickMap[ircNick];
};

NameMap.prototype.getSlackNameByIrcWhoIs = function(ircWhoIs) {
  return this.whoIsMap[ircWhoIs];
};

NameMap.prototype.setSlackNameByIrcNick = function(slackName, ircNick) {
  this.nickMap[ircNick] = slackName;
};

NameMap.prototype.replaceIrcNick = function(oldNick, newNick) {
  this.nickMap[newNick] = this.nickMap[oldNick];
  delete this.nickMap[oldNick];
};

module.exports = NameMap;

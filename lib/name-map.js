'use strict';

var _ = require('underscore');
var request = require('request');

var NameMap = function(config) {
  if (!(this instanceof NameMap)) {
    return new NameMap(config);
  }

  this.config = _.defaults(config, {
    isAutoTildeAdded: false,
    listUpdatedPeriod: 600,
    users: {}
  });

  this.accountMap = {};  // freenode account : slack username
  this.nickMap = {};  // ircNick  : slackName
  this.isChecked = false;
  this._checkMapType();
};

NameMap.prototype._checkMapType = function() {
  if (_.isString(this.config.users)) {
    this._updateMap();
  } else {
    this.accountMap = this.config.users;
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
    this.accountMap = JSON.parse(body);
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

NameMap.prototype.getIrcAccountMap = function() {
  return this.accountMap;
};

NameMap.prototype.getIrcNickMap = function() {
  return this.nickMap;
};

NameMap.prototype.getSlackNameByIrcNick = function(ircNick) {
  return this.nickMap[ircNick];
};

NameMap.prototype.getSlackNameByIrcAccount = function(ircAccount) {
  return this.accountMap[ircAccount];
};

NameMap.prototype.setSlackNameByIrcNick = function(slackName, ircNick) {
  this.nickMap[ircNick] = slackName;
};

NameMap.prototype.replaceIrcNick = function(oldNick, newNick) {
  this.nickMap[newNick] = this.nickMap[oldNick];
  delete this.nickMap[oldNick];
};

module.exports = NameMap;

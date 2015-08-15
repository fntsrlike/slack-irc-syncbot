'use strict';

var _ = require('underscore'),
  request = require('request');

var SlackRes = function(config) {
  if (!(this instanceof SlackRes)) {
    return new SlackRes(config);
  }

  this.config = _.defaults(config, {
    mapUpdatedPeriod: 600,
    isAutoUpdated: true
  });

  this.slackUsers = {};
  this.slackChannels = {};
  this.userMap = {};        // id:name
  this.avatarMap = {};      // name:avatar_url
  this.channelMap = {};     // id:name

  this.update();
};

SlackRes.prototype._check = function(body) {
  if (!JSON.parse(body).ok) {
    throw new Error('Error! Invalid Slack API Token');
  }
};

SlackRes.prototype._updateUsers = function() {
  request.get({
      url: 'https://slack.com/api/users.list?token=' + this.config.token
  }, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      this._check(body);

      var
      res = JSON.parse(body),
      userMap = this.getUserMap(),
      avatarMap = this.getAvatarMap();

      res.members.map(function(member) {
        userMap[member.id] = member.name;
        avatarMap[member.name] = member.profile.image_48;
      });

      this.setUsers(res.members);
      this.setUserMap(userMap);
      this.setAvatarMap(avatarMap);
    } else {
      console.error('Error! Can\'t get resource! Please check the Internet');
    }
  }.bind(this));
};

SlackRes.prototype._updateChannels = function() {
  request.get({
      url: 'https://slack.com/api/channels.list?token=' + this.config.token
  }, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      this._check(body);

      var
      channelMap = this.getChannelMap(),
      res = JSON.parse(body);

      res.channels.map(function(channel) {
        channelMap[channel.id] = channel.name;
      });

      this.setChannels(res.channels);
      this.setChannelMap(channelMap);
    } else {
      console.error('Error! Can\'t get resource! Please check the Internet');
    }
  }.bind(this));
};

SlackRes.prototype.update = function() {
  this._updateUsers();
  this._updateChannels();

  if (this.config.isAutoUpdated) {
    setTimeout(function() {
        this.update();
    }.bind(this), this.config.mapUpdatedPeriod * 1000);
  }
};

SlackRes.prototype.getUsers = function() {
  return this.slackUsers;
};

SlackRes.prototype.getChannels = function() {
  return this.slackChannels;
};

SlackRes.prototype.getUserMap = function() {
  return this.userMap;
};

SlackRes.prototype.getAvatarMap = function() {
  return this.avatarMap;
};

SlackRes.prototype.getChannelMap = function() {
  return this.channelMap;
};

SlackRes.prototype.setUsers = function(list) {
  this.slackUsers = list;
};

SlackRes.prototype.setChannels = function(list) {
  this.slackChannels = list;
};

SlackRes.prototype.setUserMap = function(map) {
  this.userMap = map;
};

SlackRes.prototype.setAvatarMap = function(map) {
  this.avatarMap = map;
};

SlackRes.prototype.setChannelMap = function(map) {
  this.channelMap = map;
};

module.exports = SlackRes;

'use strict';

var App = require('./lib/app');

var config = {
  nick: 'slackbot',
  username: 'slackbot-username',
  token: 'XXXX-XXXXXXXXXX-XXXXXXXXXX-XXXXXXXXXX-XXXXXX',
  incomeUrl: 'https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX',
  outgoingToken: 'XXXXXXXXXXXXXXXXXXXXXXXX',
  serverPort: 80
};

config.channels = {
  '#irc-channel password(optional)': '#slack-channel'
};

config.users = {
  'ircAccount': 'slackUser'
};

App( config ).start();

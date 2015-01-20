'use strict';

var App = require('./lib/app');

var config = {
  token: 'XXXX-XXXXXXXXXX-XXXXXXXXXX-XXXXXXXXXX-XXXXXX',
  incomeUrl: 'https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX',
  outcomeToken: 'XXXXXXXXXXXXXXXXXXXXXXXX',
  serverPort: 10080,
  minecraftServer: "http://mine.snowtec.org:8123/up/sendmessage"
};

config.users = {};

App( config ).start();

var Slack2IRC = require('./lib/slack2irc').Slack2IRC;

var config = {
  nick: 'slackbot',
  username: 'slackbot-username',
  token: 'XXXX-XXXXXXXXXX-XXXXXXXXXX-XXXXXXXXXX-XXXXXX',
  income_url: 'https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX',
  outcome_token: 'XXXXXXXXXXXXXXXXXXXXXXXX',
};

config.channels = {
  '#irc-channel password(optional)': '#slack-channel'
};

config.users = {
  'ircLogin (not nick)': 'slackUser'
};

Slack2IRC( config ).listen();

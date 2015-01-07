# Slack IRC Plugin

IRC integration with [slack](http://slack.com).

## Usage

```bash
git clone https://github.com/fntsrlike/slack-irc-plugin.git
cd slack-irc-plugin
npm install
```

Write your own configuration file (Refer `config-example.js`) is a good starting point for building your own. The details can refer Configure part in below.

Save this to a file in the root of the project then run your bot with:

    node your-config

This will launch the bot in your terminal based on provided configuration.

## Usage for Docker

This project also support docker. you can clone the project and configure it. BTW, your config file should be named `config.js`.
```shell
$ git clone https://github.com/fntsrlike/slack-irc-plugin.git
$ cd slack-irc-plugin
$ cp config.sample.js config.js
$ vim config.js
...
```

Then build image and run.
```shell
$ docker build --tag="slack-irc-plugin" ./
...
$ docker run -d slack-irc-plugin
```

If you don't want to rebuild images after editing config file, just use volume to sync config and restart container.
```shell
$ docker run -v $(pwd):/app --name="slackbot" -d slack-irc-plugin:latest
$ vim config.js
...
$ docker restart slackbot
```

In addition, if your port is not expose to 10080, remember to modify Dockerfile or use `docker run` with `-p` argument.

## Configuration
Explain configuration in config.sample.js with comment.
```javascript
var config = {
  // Require item
  nick: 'slackbot',
  username: 'slackbot-username',
  token: 'XXXX-XXXXXXXXXX-XXXXXXXXXX-XXXXXXXXXX-XXXXXX',
  income_url: 'https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX',
  outcome_token: 'XXXXXXXXXXXXXXXXXXXXXXXX',
};

// Channels map
config.channels = {
  '#irc-channel password(optional)': '#slack-channel'
};

// Users map
// Index is not nick, but username at IRC. It could be get by `/whois`.
// Value is slack's username.
config.users = {
  'ircLogin (not nick)': 'slackUser'
};
```

### Requirements
- `nick`: IRCbot's nick, it should be unique on IRC Server
- `username`: IRC bot's username
- `token`: Slack's API token
- `income_url`: From Incoming WebHooks  of Integrations
- `outcome_token`: From Outgoing WebHooks of Integrations
- `channels`: Channels map. Decide to sync which IRC chanel to Slack channel
- `users`: Users map. Let messages sync from IRC could dislpay usesname of Slack

### Options
- `server`: IRC server, default is `irc.freenode.com`
- `icon_url`: Default ICON for messages from IRC to Slack by url. 48*48 size is better
- `icon_emoji`: As icon_url but by emoji code. It will override by icon_url
- `serverPort`: The port of web application to get post request from slack. default is 80

### Flags
- `silent`: Set true to stop IRC bot from speaking into the channel
- `systemSilent`: Set true to stop speak any bot's system messages.
- `usersTracking`: Set true to tracking IRC users' nick. Otherwise, user mapping will be turn off.
- `autoTildeAdded`: Set true to add tilde prefix on IRC nicks.

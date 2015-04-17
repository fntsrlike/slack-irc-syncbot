# Slack IRC Syncbot
Synchronize messages between [Slack](http://slack.com) and [IRC](https://en.wikipedia.org/wiki/Internet_Relay_Chat).

## Usage

```bash
git clone https://github.com/fntsrlike/slack-irc-syncbot.git
cd slack-irc-syncbot
npm install
```

Write your own configuration file (Refer `config.sample.js`) is a good starting point for building your own. The details can refer Configure part in below.

Save this to a file in the root of the project then run your bot with:

    node your-config

This will launch the bot in your terminal based on provided configuration.

## Usage for Docker

This project also support docker. you can clone the project and configure it. BTW, your config file should be named `config.js`.
```shell
$ git clone https://github.com/fntsrlike/slack-irc-syncbot.git
$ cd slack-irc-syncbot
$ cp config.sample.js config.js
$ vim config.js
...
```

Then build image and run.
```shell
$ docker build --tag="slack-irc-syncbot" ./
...
$ docker run -d -P slack-irc-syncbot
```

If you don't want to rebuild images after editing config file, just use volume to sync config and restart container.
```shell
$ docker run -d -P -v $PWD/config.js:/app/config.js --name="slackbot" slack-irc-syncbot
$ vim config.js
...
$ docker restart slackbot
```

In addition, if your want to specify expose port, remember to use `-p` argument replace `-P`

## Configuration
Explain configuration in config.sample.js with comment.
```javascript
var config = {
  // Require item
  nick: 'slackbot',
  username: 'slackbot-username',
  token: 'XXXX-XXXXXXXXXX-XXXXXXXXXX-XXXXXXXXXX-XXXXXX',
  incomeUrl: 'https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX',
  outgoingToken: ['XXXXXXXXXXXXXXXXXXXXXXXX'],
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
- `incomeUrl`: From Incoming WebHooks  of Integrations
- `outgoingToken`: From Outgoing WebHooks of Integrations
- `channels`: Channels map. Decide to sync which IRC chanel to Slack channel
- `users`: Users map. Let messages sync from IRC could dislpay usesname of Slack

### Options
- `server`: IRC server, default is `irc.freenode.com`
- `iconUrl`: Default ICON for messages from IRC to Slack by url. 48*48 size is better
- `iconEmoji`: As iconUrl but by emoji code. It will override by iconUrl
- `serverPort`: The port of web application to get post request from slack. default is 80
- `initializeTimeoutLimit`: Set seconds to be limit time of initialization.
- `listUpdatedPeriod`: Set seconds to update user list

### Flags
- `isSilent`: Set true to stop IRC bot from speaking into the channel
- `isSystemSilent`: Set true to stop speak any bot's system messages
- `isUsersTracking`: Set true to tracking IRC users' nick. Otherwise, user mapping will be turn off.
- `isAutoTildeAdded`: Set true to add tilde prefix on IRC nicks
- `isShowSlackChannel`: Set true to display channel name of slack on IRC channel
- `isMapName`:
- `isMapAvatar`:

Other config options about IRCBot, can refer [node-irc](https://github.com/martynsmith/node-irc/blob/0.3.x/lib/irc.js)

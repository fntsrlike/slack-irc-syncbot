# Slack IRC Syncbot
Synchronize messages between [Slack](http://slack.com) and [IRC](https://en.wikipedia.org/wiki/Internet_Relay_Chat).

## 1. Usage for node.js

### 1-1. Requirments
- `git`
- `node.js` & `npm`

### 1-2. Steps
```bash
$ git clone https://github.com/fntsrlike/slack-irc-syncbot.git
$ cd slack-irc-syncbot
$ npm install
```

Refer `config.js.sample` to write your own configuration. Meaning of setting detail could refer the section "Configuration". After create your configuration to project root as `config.js`, execute the command:

```bash
$ node <設定檔名>
```

It will execute program. To join IRC channel may need for a while. When finished setup progress, it will display messages as following:

```bash
$ node config.js
.............done!
Server running at http://localhost:8080/
```

## 2. Usage for Docker-Compose

This project also support docker. If you have install docker and docker-compose, you can excute project without installing node.js in your local.

### 2-1. Requirements
- `git`
- `docker`
- `docker-compose`

### 2-2. Steps

After you create your own configuration as `config.js` in project root, edit `docker-compose.yml` to setting arguments of docker, usually we will set volumes and ports. At last, execute command:

```bash
$ docker-compose up -d
```

`docker` will create image and container to execute program in background.

## 3. Configuration

In thie section, we will explain how to set configuration with `config.js.sample`.

```javascript
'use strict';

var App = require('./lib/app');

// -- Setting form this line

// Basic configuration of IRCBot
// var config = {
//   nick: '<IRCBot's nick>',
//   username: '<IRCBot's username>',
//   password: '<IRCBot's password, option>',
//   token: '<Slack API token>',
//   incomeUrl: '<Slack Incoming Integrations Income Url',
//   outgoingToken: ['<Slack Outgoing Integrations token>'],
//   serverPort: 80
// };

var config = {
  nick: 'slackbot',
  username: 'slackbot-username',
  token: 'XXXX-XXXXXXXXXX-XXXXXXXXXX-XXXXXXXXXX-XXXXXX',
  incomeUrl: 'https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX',
  outgoingToken: ['XXXXXXXXXXXXXXXXXXXXXXXX', 'XXXXXXXXXXXXXXXXXXXXXXXX'],
  serverPort: 80
};

// The channels wanna be sync messages. 
config.channels = {
  '#<IRC channel> [password, option]': '#<Slack channgel>',
  '#sample' : '#general'
};

// To sync nicks and avatar of user
config.users = {
  '<IRC username（NOT NICK）>': '<Slack username>',
  'ircuser': 'slackuser'
};

// Baned list of IRC Nicks
config.bannedIRCNicks = [
  '<IRC Nick>',
  'ircNick'
];

// -- Setting end on this line

App( config ).start();
```

### 3-1. Requirements
- `nick`: IRCbot's nick, it should be unique on IRC Server
- `username`: IRC bot's username
- `token`: Slack's API token
- `incomeUrl`: From Incoming WebHooks  of Integrations
- `outgoingToken`: From Outgoing WebHooks of Integrations

### 3-2. Options
- `server`: IRC server, default is `irc.freenode.com`
- `iconUrl`: Default ICON for messages from IRC to Slack by url. 48*48 size is better
- `iconEmoji`: As iconUrl but by emoji code. It will override by iconUrl
- `serverPort`: The port of web application to get post request from slack. default is 80
- `httpsServerPort`: As `serverPort` but in https connection. default is 443.
- `initializeTimeoutLimit`: Set seconds to be limit time of initialization.
- `listUpdatedPeriod`: Set seconds to update user list

### 3-3. Flags
- `isSilent`: Set true to stop IRC bot from speaking into the channel
- `isSystemSilent`: Set true to stop speak any bot's system messages
- `isUsersTracking`: Set true to tracking IRC users' nick. Otherwise, user mapping will be turn off.
- `isAutoTildeAdded`: Set true to add tilde prefix on IRC nicks
- `isShowSlackChannel`: Set true to display channel name of slack on IRC channel
- `isMapName`: Set true to sync nicks.
- `isMapAvatar`: Set true to sync avatar
- `isHttpsConnecttion' Set `true` to turn on https connection.
- `isDisplayInfo' Set true to let index display some public information.

Other config options about IRCBot, can refer [node-irc](https://github.com/martynsmith/node-irc/blob/0.3.x/lib/irc.js)

# Slack IRC Syncbot

同步 [Slack](http://slack.com)、[IRC](https://en.wikipedia.org/wiki/Internet_Relay_Chat) 兩者之間的訊息。

## 1. 直接使用 node.js 執行

### 1-1. 前置需求
- `git`
- `node.js` & `npm`

### 1-2. 步驟

```bash
$ git clone https://github.com/fntsrlike/slack-irc-syncbot.git
$ cd slack-irc-syncbot
$ npm install
```

參考 `config.js.sample` 編寫您所需要的設定檔，設定值詳細的意義請參考下面的「設定」章節。然後將設定值儲存至專案根目錄（檔名通常是 `config.js`）。然後輸入下面的指令：

    $ node <設定檔名>

之後就會運行機器人，掛載 IRC 頻道可能會需要一段時間，當完成時，即會顯示如下的訊息：

```
$ node config.js
.............done!
Server running at http://localhost:8080/
```

## 2. 透過 Docker-Compose 執行

這個專案是支援 `Docker` 的，只要您的電腦有 `Docker` 和 `docker-compose`，您就不用刻意去安裝 `node.js`。

### 2-1. 前置需求
- `git`
- `docker`
- `docker-compose`

### 2-2. 步驟

在你修改玩設定檔後，可以在修改 `docker-compose.yml` 的 `volumes` 和 `ports` 去決定有使用的設定檔或輸出的 port。然後就可以執行下列指令

```shell
$ docker-compose up -d
```

`docker-compose` 就會去建立該 `image` 然後自動在背景執行程式。


## 3. 設定檔詳解

在這個章節我們會透過講解 `config.js.sample` 裡面項目，幫助您要如何撰寫您專屬的 `config.js`。

```javascript
'use strict';

var App = require('./lib/app');

// -- 從這邊開始進行設定

// 關於機器人的基本設定值
// var config = {
//   nick: '<IRC 機器人暱稱>',
//   username: '<IRC 機器人帳號>',
//   password: '<IRC 機器人密碼，選填>',
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

// 機器人要同步的頻道，前後分別為 IRC Server 和 Slack 的 Channel 名稱。
config.channels = {
  '#<IRC 頻道名稱> [頻道密碼、選填]': '#<Slack 頻道名稱>',
  '#sample' : '#general'
};

// 使用者暱稱、頭像同步，前後分別為 IRC Server 和 Slack 的 username。
config.users = {
  '<IRC 帳號（非暱稱）>': '<Slack 帳號>',
  'ircuser': 'slackuser'
};

// IRC 暱稱黑名單
config.bannedIRCNicks = [
  '<IRC 暱稱>',
  'ircNick'
];

// -- 到此行結束設定。

App( config ).start();
```

### 3-1. 必填的屬性
- `nick`: IRC 帳號的暱稱。每個暱稱在 IRC Server 都是不可重複的。若是重複，程式會自動加上數字遞疊。
- `username`: IRC 帳號的使用者名稱。
- `token`: Slack 的 API token。
- `incomeUrl`: Slack Incoming WebHooks Integrations 提供的網址。
- `outgoingToken`: Slack Outgoing WebHooks Integrations 提供的 `token`。若同步多個頻道，則會有多個 token，以 Array 的形式儲存。

### 3-2. 選填的屬性
#### 3-2-1. 屬性
- `server`: IRC server 位址，預設是 `irc.freenode.com`。
- `iconUrl`: IRC 同步到 Slack 訊息顯示預設頭像的網址。48 * 48 的長寬是比較推薦的。
- `iconEmoji`: 同上，但是是輸入 emoji code。效果會被 `iconUrl` 覆蓋。
- `serverPort`: 接收 Slack 訊息用的網頁所使用的 port。預設是 `80` port。
- `httpsServerPort`: 同上，但是在 https 的連線狀況。預設是 `443` port。
- `initializeTimeoutLimit`: 設定初始化時，判定超時、失敗的秒數。
- `listUpdatedPeriod`: 設定定期更新使用者名單的秒數。

#### 3-2-2. 開關
- `isSilent`: 設成 `true` 去對機器人在 IRC 上靜音。預設是 `false`。
- `isSystemSilent`: 同上。不過特別針對系統訊息。
- `isUsersTracking`: 設成 `true` 去追蹤 IRC 上使用者的暱稱。預設是 `true`。
- `isAutoTildeAdded`: 設成 `true` 去讓雙平台使用者名稱綁定的 IRC 名稱前，加上 `~` 作為前綴。預設是 `false`。
- `isShowSlackChannel`: 設成 `true` 讓同步到 Slack 訊息的使用者名稱前加上 IRC Channel 的名稱。預設是 `false`，
- `isMapName`: 設成 `true` 決定是否開啟暱稱同步的功能。預設為 `true`。
- `isMapAvatar`:設成 `true` 決定是否開啟頭像同步的功能。預設為 `true`。
- `isHttpsConnecttion' 設成 `true` 去開啟 https 連線服務。

其他關於程式的設定，可以參考 [node-irc](https://github.com/martynsmith/node-irc/blob/0.3.x/lib/irc.js)。

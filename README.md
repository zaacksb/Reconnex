<br/>
<p align="center">
  <a href="https://github.com/zaacksb/Reconnex">
    <img src="https://i.imgur.com/OOTjMER.png" alt="Logo" width="400" height="200">
  </a>

  <h3 align="center">Reconnex</h3>

  <p align="center">
    About
A simple Node JS library for connecting to websocket, with auto reconnect and utilities
    <br/>
    <br/>
    <a href="https://github.com/zaacksb/Reconnex/blob/main/README.md"><strong>Explore the docs »</strong></a>
    <br/>
    <br/>
    <a href="https://github.com/zaacksb/Reconnex/issues">Report Bug</a>
    .
    <a href="https://github.com/zaacksb/Reconnex/issues">Request Feature</a>
  </p>
</p>

![Contributors](https://img.shields.io/github/contributors/zaacksb/Reconnex?color=dark-green) ![Issues](https://img.shields.io/github/issues/zaacksb/Reconnex) ![License](https://img.shields.io/github/license/zaacksb/Reconnex)
[![npm version](https://img.shields.io/npm/v/reconnex.svg?style=flat)](https://www.npmjs.com/package/reconnex)

## About The Project

This library was created to facilitate the use of websocket, focused more specifically on reconnection, with it it is possible to send parameters that can be used for authentication, and if the connection is closed, when the connection is resumed, it will resend the data for authentication again

## Built With

This library only uses ws to establish the connection

- [ws](https://www.npmjs.com/package/ws)

## Getting Started

### Installation

First install our library

- Reconnex

```sh
npm install reconnex
```

## Usage

Import the library

```js
import Reconnex from 'reconnex'
```

instantiate the class

```js
const twitchChatWs = 'wss://irc-ws.chat.twitch.tv/'
const reconnex = new Reconnex({
  url: twitchChatWs,
  ping: {
    // Use this object when you want to automate ping
    data: 'PING', // Data sent with each ping
    interval: 4 * 60 * 1000, // Interval time between each sending
  },
  options: {}, // Ws connection options
  reconnect: {
    maxAttempts: -1, // Maximum attempts to reconnect, use -1 for infinite, default is 10
    connectTimeout: 10 * 1000, // Waiting time to try to reconnect. By default it is 5 seconds
  },
})
```

open the connection

```js
reconnex.open()
```

#### Sending Authentication Payloads

```js
const joinChannel = 'zvods'

const authenticationPayloads = ['CAP REQ :twitch.tv/tags twitch.tv/commands', 'PASS SCHMOOPIIE', 'NICK justinfan4194', 'USER justinfan4194 8 * :justinfan4194', `JOIN #${joinChannel}`]

authenticationPayloads.forEach((payload) => reconnex.sendOnConnect(payload))
```

sendOnConnect is perfect for fixed authentications and room entries; it automatically resends specified parameters upon reconnection, ensuring seamless continuity.

#### Event Handling

```js
reconnex.on('send', (data) => {
  console.log(`Data sent: ${data}`)
})

reconnex.on('error', (err) => {
  if (err.code === 'ENOTFOUND') return console.log('No Internet Connection')
  console.error(err)
})

reconnex.on('open', (url) => {
  console.log(`Connected at ${url}`)
})

reconnex.on('close', (code, reason) => {
  console.log(`WebSocket disconnected with code ${code} ${reason}`)
})

reconnex.on('retry', (attempt, max) => {
  console.log(`Trying to reconnect ${attempt} of ${max}`)
})

reconnex.on('max_attempt', () => {
  console.log('Reconnect attempt limit reached')
})

reconnex.on('message', (message) => {
  // console.log(message) default websocket message
})

reconnex.on('text', (text) => {
  console.log(`Text Received: ${text}`)
})
```

### Additional Functions

* ``waitTwitchWSConnected``
  Waits until the WebSocket connection is open.
 ```js
  await reconnex.waitTwitchWSConnected()
  ```
* ``disconnect``
  Disconnects the WebSocket connection.
 ```js
  reconnex.disconnect('Optional reason');
 ```
* ``open``
  Opens the WebSocket connection if not already opened.
```js
  reconnex.open()
```
* ``send``
  Sends text or binary data over the WebSocket connection.
 ```js
  reconnex.send('Sample message');
 ```
* ``json``
  Sends JSON data over the WebSocket connection.
 ```js
  reconnex.json({ key: 'value' });
 ```
* ```sendOnConnect``` and ```removeSendOnConnect```
  Adds and removes strings to be sent on connection.
 ```js
  reconnex.sendOnConnect('Authentication');
  reconnex.removeSendOnConnect('Authentication');
 ```

* ``isConnected``
  Checks if the WebSocket connection is open.
 ```js
  const isConnected = reconnex.isConnected();
 ```

## License

Distributed under the MIT License. See [LICENSE](https://github.com/zaacksb/Reconnex/blob/main/LICENSE) for more information.

## Authors

- **ZackSB** - _Master's degree in life_ - [ZackSB](https://github.com/zaacksb/) - _Built Reconnex_

## Acknowledgements

- [zacksb](https://github.com/zaacksb)

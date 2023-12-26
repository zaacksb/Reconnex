export const twitchChatWs = "wss://irc-ws.chat.twitch.tv/"
import Reconnex from './src/index'

const joinChannel = 'zvods'

const authenticationPayloads = [
  'CAP REQ :twitch.tv/tags twitch.tv/commands	',
  'PASS SCHMOOPIIE',
  'NICK justinfan4194',
  'USER justinfan4194 8 * :justinfan4194',
  `JOIN #${joinChannel}`
]

const reconex = new Reconnex({
  url: twitchChatWs,
  ping: {
    data: 'PING',
    interval: 4 * 60 * 1000
  },
  reconnect: {
    maxAttempts: -1
  }
})
reconex.open()
authenticationPayloads.forEach(payload => reconex.sendOnConnect(payload))
reconex.on('send', (data) => {
  console.log(`Data sent: ${data}`)
})
reconex.on('error', (err) => {
  if (err.code == 'ENOTFOUND') return console.log('No Internet Connection')
  console.log(err)
})
reconex.on('open', (url) => {
  console.log(`Connected at ${url}`)
})
reconex.on('close', (code, reason) => {
  console.log(`Websocket disconnected with code ${code} ${reason}`)
})
reconex.on('retry', (attempt, max) => {
  console.log(`Trying to reconnect ${attempt} of ${max}`)
})
reconex.on('max_attempt', () => {
  console.log('Reconnect attempt limit reached')

})
reconex.on('text', (text) => {
  console.log(`Text Received: ${text}`)
})


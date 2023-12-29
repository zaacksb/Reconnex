import { Reconnex } from './src/index'
const twitchChatWs = "wss://irc-ws.chat.twitch.tv/"
const joinChannel = 'pedrosemfreio'

const authenticationPayloads = [
  'CAP REQ :twitch.tv/tags twitch.tv/commands	',
  'PASS SCHMOOPIIE',
  'NICK justinfan4194',
  'USER justinfan4194 8 * :justinfan4194',
  `JOIN #${joinChannel}`
]

const reconnex = new Reconnex({
  url: twitchChatWs,
  ping: { // Use this object when you want to automate ping
    data: 'PING', // Data sent with each ping
    interval: 4 * 60 * 1000 // Interval time between each sending
  },
  options: {}, // Ws connection options
  reconnect: {
    maxAttempts: -1, // Maximum attempts to reconnect, use -1 for infinite, default is 10
    connectTimeout: 10 * 1000 // Waiting time to try to reconnect. By default it is 5 seconds
  }
})
reconnex.open()
authenticationPayloads.forEach(payload => reconnex.sendOnConnect(payload))
reconnex.on('send', (data) => {
  console.log(`Data sent: ${data}`)
})
reconnex.on('error', (err) => {
  if (err.code == 'ENOTFOUND') return console.log('No Internet Connection')
  console.log(err)
})
reconnex.on('open', (url) => {
  console.log(`Connected at ${url}`)
})
reconnex.on('close', (code, reason) => {
  console.log(`Websocket disconnected with code ${code} ${reason}`)
})
reconnex.on('retry', (attempt, max) => {
  console.log(`Trying to reconnect ${attempt} of ${max}`)
})
reconnex.on('max_attempt', () => {
  console.log('Reconnect attempt limit reached')

})
reconnex.on('text', (text) => {
  console.log(`Text Received: ${text}`)
})

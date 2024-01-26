import { ClientRequestArgs } from 'http'
import EventEmitter from 'events'
import type { WebSocket, ClientOptions, RawData } from 'ws'

const runningOnNodejs: string | false = (typeof process !== 'undefined' && process.versions && process.versions.node);

const sleep = (time: number = 1000) => new Promise(resolve => setTimeout(resolve, time))

export type ReconnexT = {
  url: string
  reconnect?: {
    maxAttempts?: number
    connectTimeout?: number,
  }
  ping?: {
    data: any
    interval: number
  }
  options?: ClientOptions | ClientRequestArgs | undefined
}

export class Reconnex extends EventEmitter {
  #connectionOpenned = false
  #sendOnConnectStrings: string[] = []
  #reconnectOpts = {
    maxAttempts: 10,
    connectTimeout: 5 * 1000,

  }
  #pingOpts = {
    data: null,
    interval: 60 * 1000,
  }
  #currentRetries = 0
  #ws: WebSocket | null = null
  #url: string
  #options
  constructor({ url, ping, reconnect, options }: ReconnexT) {
    super()
    if (ping) this.#pingOpts = { ...this.#pingOpts, ...ping }
    if (reconnect) this.#reconnectOpts = { ...this.#reconnectOpts, ...reconnect }
    this.#url = url
    this.#options = options
  }

  on<E extends keyof ReconnexEvents>(event: E, listener: ReconnexEvents[E]): this {
    return super.on(event, listener);
  }

  private connect() {
    const _WebSocket = !runningOnNodejs ? window?.WebSocket : require('ws')
    this.#ws = new _WebSocket(this.#url, this.#options)
    this.addWSListeners()
    return this.#ws
  }

  private addWSListeners() {
    let intervalPing: NodeJS.Timeout
    this.#ws?.addEventListener('open', () => {
      this.#currentRetries = 0
      this.#connectionOpenned = true
      this.#sendOnConnectStrings.forEach(data => this.send(data))
      if (this.#pingOpts?.data) {
        intervalPing = setInterval(() => {
          if (this.#pingOpts?.data) this.send(this.#pingOpts.data)
        }, this.#pingOpts.interval)
      }
      this.emit('open', this.#url)
    })
    this.#ws?.addEventListener('error', (err) => {
      this.emit('error', err)
    })
    this.#ws?.addEventListener('message', (buffer) => {
      this.emit('message', buffer)
      try {
        this.emit('text', new TextDecoder().decode(buffer.data as any))
      } catch (e) {
        this.emit('text', buffer.data)
      }
    })

    this.#ws?.addEventListener('close', async ({ code, reason }) => {
      clearInterval(intervalPing)
      this.#currentRetries++
      this.emit('close', code, reason.toString())
      if (code !== 4452) {
        if (this.#currentRetries <= this.#reconnectOpts.maxAttempts || this.#reconnectOpts.maxAttempts == -1) {
          await sleep(this.#reconnectOpts.connectTimeout)
          this.emit('retry', this.#currentRetries, this.#reconnectOpts.maxAttempts == -1 ? Infinity : this.#reconnectOpts.maxAttempts)
          this.connect()
        } else {
          this.emit('max_attempt')
        }
      } else {
        this.#connectionOpenned = false
      }
    })
  }

  public async waitTwitchWSConnected() {
    return new Promise(resolve => {
      setInterval(() => {
        if (this.#ws?.readyState == 1) resolve(true)
      }, 10)
    })
  }


  public disconnect = (reason?: string) => { this.#ws?.close(4452, reason) }
  public open = () => !this.#connectionOpenned && this.connect()
  public send = async (text: string | Buffer) => {
    await this.waitTwitchWSConnected()
    this.#ws?.send?.(text)
    this.emit('send', text.toString())
  }
  public json = async (data: any) => {
    await this.waitTwitchWSConnected()
    this.#ws?.send?.(JSON.stringify(data))
    this.emit('send', JSON.stringify(data))
  }

  public sendJSONBinary = async (data: any) => {
    await this.waitTwitchWSConnected()
    var encoder = new TextEncoder();
    this.#ws?.send(encoder.encode(JSON.stringify(data)) as any);
  }

  public sendOnConnect = (content?: string) => {
    if (content) {
      this.#sendOnConnectStrings.push(content)
      if (this.isConnected()) this.send(content)
    }
    return this.#sendOnConnectStrings
  }
  public removeSendOnConnect = (content: string) => {
    const index = this.#sendOnConnectStrings.indexOf(content)
    this.#sendOnConnectStrings.splice(index, 1);
    return this.#sendOnConnectStrings
  }

  public isConnected = () => this.#ws?.readyState == 1
}


export type onTextEvent = (text: string) => void
export type onMessageEvent = (message: RawData) => void
export type onCloseEvent = (code: number, reason?: Buffer | string) => void
export type onOpenEvent = (url: string) => void
export type onMaxAttemptEvent = () => void

interface CustomError extends Error {
  code?: string;
}

export type onErrorEvent = (err: CustomError) => void
export type onSendEvent = (data: string) => void
export type onRetryEvent = (attempt: number, maxAttempts: number) => void

export type ReconnexEvents = {
  text: onTextEvent
  message: onMessageEvent
  close: onCloseEvent
  open: onOpenEvent
  max_attempt: onMaxAttemptEvent
  error: onErrorEvent
  send: onSendEvent
  retry: onRetryEvent
}
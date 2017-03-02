const http = require('http')
const https = require('https')
const { Stream } = require('most')
const { parse } = require('url')
const { tryEvent } = require('./tryEvent')

const toString = buff => buff.toString()
const jParse = str => JSON.parse(str)
const stringify = obj => JSON.stringify(obj)
const keys = obj => Object.keys(obj)
const dissoc = (str, obj) =>
    keys(obj).reduce((acc, k) => k !== str ? (acc[k] = obj[k], acc) : acc, {})


const sendResponse = (res, chunks, time, sink) => {
    const { statusCode, statusMessage, headers } = res
    const buffer = Buffer.concat(chunks)
    tryEvent(time, {
        statusCode,
        statusMessage,
        headers,
        ok: (statusCode / 200 | 0) === 1,
        buffer,
        text: () => buffer.toString(),
        json: () => JSON.parse(buffer.toString())
    }, sink)
}

const client = (url, opts = {}) => new Stream(new HttpEvent(url, opts))
class HttpEvent {
    constructor(url, opts) {
        this.url = url
        this.opts = opts
    }
    _requestHandler(sink, time, scheduler) {
	const self = this
        const chunks = []
        return res => {
            if (res.headers.location && res.statusCode >= 300 && res.statusCode < 400) {
                self.url = res.headers.location
                self.run(sink, scheduler)
                return
            }
            res.on('data', chunk => chunks.push(chunk))
            res.on('end', sendResponse.bind(null, res, chunks, time, sink))
        }
    }
    run(sink, scheduler) {
        const time = scheduler.now()
        const url = this.url
        const opts = this.opts
        const error = sink.error.bind(sink, time)
        const event = sink.event.bind(sink, time)

        const options = dissoc('body', Object.assign({}, parse(url), opts))
        const body = opts.body || ''
        const protocol = options.protocol === 'https:' ? https : http

        const req = protocol.request(options, this._requestHandler(sink, time, scheduler))
        req.on('error', error)
        req.on('timeout', () => (req.abort(), error(new Error('Request timed out'))))
        req.end(body)
        return {
            dispose: () => req.abort()
        }
    }
}



client(process.argv[process.argv.length - 1])
    .map(res => res.json())
    .observe(console.log)
    .catch(err => console.log(`Caught: ${err}`))

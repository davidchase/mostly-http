const http = require('http')
const https = require('https')
const { parse } = require('url')
const { tryEvent } = require('./tryEvent')
const { sendResponse } = require('./helpers')

module.exports = class HttpEvent {
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

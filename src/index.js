const { Stream } = require('most')
const HttpEvent = require('./source')

module.exports.client = (url, opts = {}) => new Stream(new HttpEvent(url, opts))

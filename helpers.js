const keys = obj => Object.keys(obj)
const dissoc = (str, obj) =>
      keys(obj).reduce((acc, k) => k !== str ? (acc[k] = obj[k], acc) : acc, {})


module.exports.sendResponse = (res, chunks, time, sink) => {
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


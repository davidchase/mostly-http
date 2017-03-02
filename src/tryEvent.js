module.exports.tryEvent = function tryEvent(time, value, sink) {
    try {
        sink.event(time, value)
    } catch (err) {
        sink.error(time, err)
    }
}

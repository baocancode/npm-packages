const spawn = jest.fn()

module.exports = Object.assign(spawn, { createChildProcessWithEvents })

function createChildProcessWithEvents (listen, eventToEmit) {
  return {
    on (event, handler) {
      listen(event)
      if (event === eventToEmit) {
        process.nextTick(() => handler(event))
      }
      return this
    }
  }
}

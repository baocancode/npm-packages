jest.mock('cross-spawn')

const spawn = require('cross-spawn')
const { run, runInBackground } = require('..')

describe('run', () => {
  const listen = jest.fn()
  const createMockValue = (eventToEmit) => ({
    on (event, handler) {
      listen(event)
      if (event === eventToEmit) {
        process.nextTick(() => handler(event))
      }
      return this
    }
  })
  it('should create child process with default options', async () => {
    spawn.mockReturnValueOnce(createMockValue('close'))
    await expect(run('a', ['b', 'c'])).resolves.toBe('close')
    expect(spawn.mock.calls.length).toBe(1)
    expect(spawn.mock.calls[0]).toEqual(['a', ['b', 'c'], { stdio: ['pipe', process.stdout, process.stderr], env: process.env }])
  })
  it('should extend default options by provided ones', async () => {
    spawn.mockReturnValueOnce(createMockValue('close'))
    await expect(run('a', ['b', 'c'], { stdio: 'test', d: 1 })).resolves.toBe('close')
    expect(spawn.mock.calls.length).toBe(1)
    expect(spawn.mock.calls[0]).toEqual(['a', ['b', 'c'], { stdio: 'test', env: process.env, d: 1 }])
  })
  it('should listen to close and error events', async () => {
    spawn.mockReturnValueOnce(createMockValue('close'))
    await expect(run('a', ['b', 'c'])).resolves.toBe('close')
    expect(listen.mock.calls.length).toBe(2)
    expect(listen.mock.calls[0][0]).toBe('close')
    expect(listen.mock.calls[1][0]).toBe('error')
  })
  it('should reject if error', async () => {
    spawn.mockReturnValueOnce(createMockValue('error'))
    await expect(run('a', ['b', 'c'])).rejects.toBe('error')
  })
})

describe('runInBackground', () => {
  const unref = jest.fn()
  it('should create child process with default options', () => {
    spawn.mockReturnValueOnce({ unref })
    runInBackground('a', ['b', 'c'])
    expect(spawn.mock.calls.length).toBe(1)
    expect(spawn.mock.calls[0]).toEqual(['a', ['b', 'c'], { stdio: 'ignore', detached: true }])
  })
  it('should extend default options by provided ones', () => {
    spawn.mockReturnValueOnce({ unref })
    runInBackground('a', ['b', 'c'], { stdio: 'test', d: 1 })
    expect(spawn.mock.calls.length).toBe(1)
    expect(spawn.mock.calls[0]).toEqual(['a', ['b', 'c'], { stdio: 'test', detached: true, d: 1 }])
  })
  it('should unref child process', () => {
    spawn.mockReturnValueOnce({ unref })
    runInBackground('a', ['b', 'c'])
    expect(unref.mock.calls.length).toBe(1)
  })
})

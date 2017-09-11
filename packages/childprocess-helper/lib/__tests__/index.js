const spawn = require('cross-spawn')
jest.unmock('..')
const childprocessHelper = require('..')

describe('run', () => {
  const { run } = childprocessHelper
  const listen = jest.fn()
  beforeEach(() => {
    spawn.mockReturnValueOnce(spawn.createChildProcessWithEvents(listen, 'close'))
  })
  it('should create child process with default options', async () => {
    await expect(run('a', ['b', 'c'])).resolves.toBe('close')
    expect(spawn.mock.calls.length).toBe(1)
    expect(spawn.mock.calls[0]).toEqual(['a', ['b', 'c'], { stdio: ['pipe', process.stdout, process.stderr], env: process.env }])
  })
  it('should extend default options by provided ones', async () => {
    await expect(run('a', ['b', 'c'], { stdio: 'test', d: 1 })).resolves.toBe('close')
    expect(spawn.mock.calls.length).toBe(1)
    expect(spawn.mock.calls[0]).toEqual(['a', ['b', 'c'], { stdio: 'test', env: process.env, d: 1 }])
  })
  it('should listen to close and error events', async () => {
    await expect(run('a', ['b', 'c'])).resolves.toBe('close')
    expect(listen.mock.calls.length).toBe(2)
    expect(listen.mock.calls[0][0]).toBe('close')
    expect(listen.mock.calls[1][0]).toBe('error')
  })
  it('should reject if error', async () => {
    spawn.mockReset()
    spawn.mockReturnValueOnce(spawn.createChildProcessWithEvents(listen, 'error'))
    await expect(run('a', ['b', 'c'])).rejects.toBe('error')
  })
})

describe('runInBackground', () => {
  const { runInBackground } = childprocessHelper
  const unref = jest.fn()
  beforeEach(() => {
    spawn.mockReturnValueOnce({ unref })
  })
  it('should create child process with default options', () => {
    runInBackground('a', ['b', 'c'])
    expect(spawn.mock.calls.length).toBe(1)
    expect(spawn.mock.calls[0]).toEqual(['a', ['b', 'c'], { stdio: 'ignore', detached: true }])
  })
  it('should extend default options by provided ones', () => {
    runInBackground('a', ['b', 'c'], { stdio: 'test', d: 1 })
    expect(spawn.mock.calls.length).toBe(1)
    expect(spawn.mock.calls[0]).toEqual(['a', ['b', 'c'], { stdio: 'test', detached: true, d: 1 }])
  })
  it('should unref child process', () => {
    runInBackground('a', ['b', 'c'])
    expect(unref.mock.calls.length).toBe(1)
    expect(unref.mock.calls[0]).toEqual([])
  })
})

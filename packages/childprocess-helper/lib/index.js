const spawn = require('cross-spawn')

exports.run = function (command, args, options = {}) {
  return new Promise((resolve, reject) => {
    spawn(command, args, { stdio: ['pipe', process.stdout, process.stderr], env: process.env, ...options })
      .on('close', resolve)
      .on('error', reject)
  })
}

exports.runInBackground = function (command, args, options = {}) {
  spawn(command, args, { stdio: 'ignore', detached: true, ...options })
    .unref()
}

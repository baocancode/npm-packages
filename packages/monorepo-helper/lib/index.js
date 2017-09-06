const path = require('path')
const fs = require('fs-extra')
const { createPaths } = require('./paths')
const commands = {
  boot: require('./boot'),
  build: require('./build'),
  clean: require('./clean'),
  run: require('./run')
}

const internal = {}

module.exports = Object.assign(
  (options) => internal.monorepoHelper(internal, options),
  { internal }
)

internal.monorepoHelper = async function (context, options) {
  const { packageContainer, argv } = options
  const packageNames = await context.findPackages(context, packageContainer)
  return commands[argv[0]]({ ...options, packageNames })
}

internal.findPackages = async function (context, packageContainer) {
  return fs.readdirSync(path.resolve(packageContainer))
    .filter((childName) => fs.statSync(createPaths(packageContainer, childName).base).isDirectory())
    .filter((childName) => fs.existsSync(createPaths(packageContainer, childName).info))
}

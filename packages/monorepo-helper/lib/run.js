const childProcess = require('childprocess-helper')
const { createPaths } = require('./paths')

const internal = {}

module.exports = Object.assign(
  (options) => internal.runInPackages(internal, options),
  { internal }
)

internal.runInPackages = async function (context, options) {
  const { packageNames } = options
  for (const packageName of packageNames) {
    const exitCode = await context.runInPackage(context, options, packageName)
    if (exitCode) {
      return exitCode
    }
  }
  return 0
}

internal.runInPackage = async function (context, options, packageName) {
  const { argv, packageContainer } = options
  const command = argv[1]
  const args = argv.slice(2)
  const packagePaths = createPaths(packageContainer, packageName)
  return childProcess.run(command, args, { cwd: packagePaths.base })
}

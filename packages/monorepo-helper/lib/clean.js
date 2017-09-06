const fs = require('fs-extra')
const { createPaths } = require('./paths')

const internal = {}

module.exports = Object.assign(
  (options) => internal.cleanPackages(internal, options),
  { internal }
)

internal.cleanPackages = async function (context, options) {
  const { packageNames } = options
  for (const packageName of packageNames) {
    await context.cleanPackage(context, options, packageName)
  }
}

internal.cleanPackage = async function (context, options, packageName) {
  const { packageContainer } = options
  const packagePaths = createPaths(packageContainer, packageName)
  await fs.remove(packagePaths.moduleContainer)
  await fs.remove(packagePaths.coverage)
  await fs.remove(packagePaths.license)
  const updatedPackageInfo = await context.cleanPackageInfo(packagePaths)
  await fs.writeJson(packagePaths.info, updatedPackageInfo, { spaces: 2 })
}

internal.cleanPackageInfo = async function (packagePaths) {
  const packageInfo = await fs.readJson(packagePaths.info)
  delete packageInfo.repository
  delete packageInfo.author
  delete packageInfo.license
  delete packageInfo.dependencies
  return packageInfo
}

const path = require('path')
const fs = require('fs-extra')
const { rootPaths, createPaths } = require('./paths')

const internal = {}

module.exports = Object.assign(
  (options) => internal.bootPackages(internal, options),
  { internal }
)

internal.bootPackages = async function (context, options) {
  const { packageContainer, packageNames } = options
  const linkedPackageContainerPath = path.resolve(packageContainer, 'node_modules')
  await fs.remove(linkedPackageContainerPath)
  await fs.ensureDir(linkedPackageContainerPath)
  for (const packageName of packageNames) {
    await context.bootPackage(context, options, packageName, linkedPackageContainerPath)
  }
}

internal.bootPackage = async function (context, options, packageName, linkedPackageContainerPath) {
  const { packageContainer, defaultBins } = options
  const packagePaths = createPaths(packageContainer, packageName)
  await context.linkPackage(context, packageName, packagePaths, linkedPackageContainerPath)
  await fs.remove(packagePaths.moduleContainer)
  await fs.ensureDir(packagePaths.binContainer)
  const bins = defaultBins.concat(await context.getBins(packagePaths))
  for (const bin of bins) {
    context.linkBin(context, packagePaths, bin)
    context.linkModule(context, packagePaths, bin)
  }
}

internal.linkPackage = async function (context, packageName, packagePaths, linkedPackageContainerPath) {
  const packageInfo = await fs.readJson(packagePaths.info)
  if (packageInfo.private) {
    return
  }
  fs.symlinkSync(packagePaths.base, path.join(linkedPackageContainerPath, packageName), 'dir')
}

internal.getBins = async function (packagePaths) {
  const packageInfo = await fs.readJson(packagePaths.info)
  const packageConfig = packageInfo.config && packageInfo.config['monorepo-helper']
  return (packageConfig && packageConfig.bins) || []
}

internal.linkBin = async function (context, packagePaths, bin) {
  const rootBinPath = rootPaths.getBin(bin)
  if (fs.existsSync(rootBinPath)) {
    fs.symlinkSync(rootBinPath, packagePaths.getBin(bin), 'file')
  }
  if (path.extname(bin) !== '.cmd') {
    context.linkBin(context, packagePaths, `${bin}.cmd`)
  }
}

internal.linkModule = async function (context, packagePaths, moduleName) {
  const rootModulePath = rootPaths.getModule(moduleName)
  if (fs.existsSync(rootModulePath)) {
    fs.symlinkSync(rootModulePath, packagePaths.getModule(moduleName), 'dir')
  }
}

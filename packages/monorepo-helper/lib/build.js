const path = require('path')
const fs = require('fs-extra')
const precinct = require('precinct')
const isBuiltinModule = require('is-builtin-module')
const { rootPaths, createPaths } = require('./paths')

const internal = {}

module.exports = Object.assign(
  (options) => internal.buildPackages(internal, options),
  { internal }
)

internal.buildPackages = async function (context, options) {
  const { packageNames } = options
  const allDepVersions = await context.getAllDepVersions(context, options)
  for (const packageName of packageNames) {
    await context.buildPackage(context, options, packageName, allDepVersions)
  }
}

internal.getAllDepVersions = async function (context, options) {
  const { packageContainer, packageNames } = options
  const rootInfo = await fs.readJson(rootPaths.info)
  const allDepVersions = { ...rootInfo.dependencies }
  for (const packageName of packageNames) {
    const packagePaths = createPaths(packageContainer, packageName)
    const packageInfo = await fs.readJson(packagePaths.info)
    allDepVersions[packageInfo.name] = `^${packageInfo.version}`
  }
  return allDepVersions
}

internal.buildPackage = async function (context, options, packageName, allDepVersions) {
  const { packageContainer } = options
  const packagePaths = createPaths(packageContainer, packageName)
  await fs.copy(rootPaths.license, packagePaths.license)
  const dependencies = await context.getDependencies(context, packagePaths, allDepVersions)
  const updatedPackageInfo = await context.generatePackageInfo(context, packageContainer, packageName, dependencies)
  await fs.writeJson(packagePaths.info, updatedPackageInfo, { spaces: 2 })
}

internal.getDependencies = async function (context, packagePaths, allDepVersions) {
  return (await context.getDepModules(context, packagePaths))
    .reduce((depVersions, dep) => {
      const version = allDepVersions[dep]
      if (version) {
        depVersions[dep] = version
      }
      return depVersions
    }, {})
}

internal.getDepModules = async function (context, packagePaths) {
  const deps = {}
  context.updateDeps(context, deps, packagePaths.base)
  const depModules = Object.keys(deps)
  depModules.sort()
  return depModules
}

internal.updateDeps = function (context, deps, dirPath) {
  fs.readdirSync(dirPath)
    .filter((childName) => childName !== 'node_modules')
    .filter((childName) => childName.indexOf('.'))
    .forEach((childName) => {
      const childPath = path.join(dirPath, childName)
      if (fs.statSync(childPath).isDirectory()) {
        context.updateDeps(context, deps, childPath)
      } else if (path.extname(childPath) === '.js') {
        precinct(fs.readFileSync(childPath, 'utf8'))
          .map((dep) => dep.split('/')[0])
          .filter((dep) => dep.indexOf('.'))
          .filter((dep) => !isBuiltinModule(dep))
          .forEach((dep) => { deps[dep] = true })
      }
    })
}

internal.generatePackageInfo = async function (context, packageContainer, packageName, dependencies) {
  const packagePaths = createPaths(packageContainer, packageName)
  const rootInfo = await fs.readJson(rootPaths.info)
  const packageInfo = await fs.readJson(packagePaths.info)
  return {
    ...packageInfo,
    repository: `${rootInfo.repository}/tree/master/${packageContainer}/${packageName}`,
    author: rootInfo.author,
    license: rootInfo.license,
    dependencies
  }
}

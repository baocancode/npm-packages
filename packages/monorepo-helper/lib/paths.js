const path = require('path')

exports.rootPaths = createPaths()

exports.createPaths = createPaths

function createPaths () {
  const paths = {}
  paths.base = path.resolve.apply(path, arguments)
  paths.info = path.join(paths.base, 'package.json')
  paths.license = path.join(paths.base, 'LICENSE')
  paths.coverage = path.join(paths.base, 'coverage')
  paths.moduleContainer = path.join(paths.base, 'node_modules')
  paths.getModule = (moduleName) => path.join(paths.moduleContainer, moduleName)
  paths.binContainer = path.join(paths.moduleContainer, '.bin')
  paths.getBin = (bin) => path.join(paths.binContainer, bin)
  return paths
}

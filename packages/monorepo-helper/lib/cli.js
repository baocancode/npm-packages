#!/usr/bin/env node

const fs = require('fs-extra')
const monorepoHelper = require('.')
const { rootPaths } = require('./paths')

/* istanbul ignore if */
if (require.main === module) {
  cli({ argv: process.argv.slice(2), exit: process.exit })
    .catch(console.error)
}

module.exports = cli

async function cli (options) {
  const { argv, exit } = options
  const rootInfo = await fs.readJson(rootPaths.info)
  const config = rootInfo.config['monorepo-helper']
  const exitCode = await monorepoHelper({ ...config, argv })
  exit(exitCode || 0)
}

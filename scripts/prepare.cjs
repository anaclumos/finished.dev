#!/usr/bin/env node
'use strict'

const { existsSync } = require('node:fs')
const { spawnSync } = require('node:child_process')

// `prepare` runs during installs in CI and when deploying from source.
// When the install happens without a `.git` directory (e.g. Vercel source upload),
// `lefthook install` will fail. In those environments we can safely skip.
if (!existsSync('.git')) {
  process.exit(0)
}

const result = spawnSync('lefthook', ['install'], { stdio: 'inherit' })
process.exit(result.status ?? 1)

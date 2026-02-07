import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const pkgPath = resolve(process.cwd(), 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

// Add or update resolutions to force ESLint v10
pkg.resolutions = {
  ...pkg.resolutions,
  eslint: '^10.0.0',
}

// Write back to package.json
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8')

console.log('✓ Updated package.json with ESLint v10 resolution')

// Reinstall dependencies
console.log('Installing dependencies with ESLint v10...')
execSync('pnpm install', { stdio: 'inherit' })

console.log('✓ Successfully installed ESLint v10')

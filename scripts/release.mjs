// Local, signed release for Boly.
//
// WHY THIS EXISTS:
//   The Certum "in the Cloud" (SimplySign) certificate only lives on your
//   Windows machine while SimplySign Desktop is logged in, so it CANNOT run in
//   GitHub Actions. Auto-update (electron-updater) also requires the *signed*
//   installer to be the exact file hashed into latest.yml + .blockmap, which
//   means signing must happen DURING electron-builder packaging (not after).
//   So real releases are built + signed + published from here, locally.
//
// See RELEASING.md for the full runbook.

import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import process from 'node:process'

// The exact "Issued to" subject (CN) of your Certum OV certificate.
// Fill this in once the cert is issued, or export CERTUM_SUBJECT before running.
const CERTUM_SUBJECT = process.env.CERTUM_SUBJECT || 'FILL_ME_IN'

// Certum's RFC 3161 timestamp server. A timestamp keeps signatures valid after
// the cert expires; without it, installers "expire" when the cert does.
const TIMESTAMP_URL = process.env.CERTUM_TIMESTAMP_URL || 'http://time.certum.pl'

// Optional: mirror the installer to S3 (same key the site serves as "latest").
// Leave unset to skip. Requires the aws CLI + credentials on this machine.
const S3_BUCKET = process.env.RELEASE_S3_BUCKET // e.g. my-boly-bucket

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'

function run(cmd, args) {
  console.log(`\n> ${cmd} ${args.join(' ')}\n`)
  execFileSync(cmd, args, { stdio: 'inherit', env: process.env })
}

function fail(msg) {
  console.error(`\n[release] ${msg}\n`)
  process.exit(1)
}

// --- Preflight ---------------------------------------------------------------

if (process.platform !== 'win32') {
  fail(
    'Signed releases must run on Windows with Certum SimplySign Desktop logged in.\n' +
      'This machine is ' +
      process.platform +
      '. Run this on your Windows box.'
  )
}

if (CERTUM_SUBJECT === 'FILL_ME_IN') {
  fail(
    'CERTUM_SUBJECT is not set.\n' +
      'Set the exact certificate subject (CN) at the top of scripts/release.mjs,\n' +
      'or run:  set CERTUM_SUBJECT=Your Company Legal Name  (then npm run release)'
  )
}

if (!process.env.GH_TOKEN) {
  fail(
    'GH_TOKEN is not set. electron-builder needs a GitHub token with repo write\n' +
      'access to publish the release. Set it, then re-run:\n' +
      '   set GH_TOKEN=ghp_xxx'
  )
}

console.log(`[release] Signing as: "${CERTUM_SUBJECT}"`)
console.log(`[release] Timestamp:  ${TIMESTAMP_URL}`)
console.log('[release] Make sure SimplySign Desktop is logged in (virtual card mounted).')

// --- Build + sign + publish --------------------------------------------------

run('npm', ['run', 'typecheck'])
run(npx, ['electron-vite', 'build'])

// Signing config is injected ONLY here via -c overrides, so electron-builder.yml
// stays unsigned and CI (which has no certificate) never tries to sign.
run(npx, [
  'electron-builder',
  '--win',
  '--publish',
  'always',
  `--config.win.signtoolOptions.certificateSubjectName=${CERTUM_SUBJECT}`,
  `--config.win.signtoolOptions.publisherName=${CERTUM_SUBJECT}`,
  `--config.win.signtoolOptions.rfc3161TimeStampServer=${TIMESTAMP_URL}`
])

// --- Optional: mirror to S3 --------------------------------------------------

if (S3_BUCKET) {
  const pkg = JSON.parse(
    execFileSync('node', ['-p', 'JSON.stringify(require("./package.json"))']).toString()
  )
  const setup = `dist_new/boly-${pkg.version}-setup.exe`
  if (!existsSync(setup)) {
    fail(`Expected installer not found: ${setup}`)
  }
  run(process.platform === 'win32' ? 'aws.cmd' : 'aws', [
    's3',
    'cp',
    setup,
    `s3://${S3_BUCKET}/boly-Setup.exe`
  ])
  console.log('[release] Uploaded signed installer to S3.')
} else {
  console.log('[release] RELEASE_S3_BUCKET not set — skipping S3 upload.')
}

console.log('\n[release] Done. Verify the signature:')
console.log('   signtool verify /pa /v dist_new\\boly-<version>-setup.exe\n')

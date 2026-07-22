# Migrating Boly to signed Windows builds (Certum OV)

**Status: NOT APPLIED.** Builds currently run the old way — CI auto-builds an
unsigned installer on version bump and publishes to GitHub Releases + S3. Follow
this doc when you're ready to switch to signed releases. Do the Phase 0 purchase
first; it has a multi-day validation wait.

## Why

Unsigned installers trigger the Windows SmartScreen "Publisher: Unknown" warning
and never accrue reputation. Signing with an OV certificate shows "FFStudios" as
the verified publisher immediately and lets SmartScreen reputation build over
time. For a Chilean company in 2026 this is the best achievable outcome — Azure
Trusted Signing is US/CA/EU/UK-only, and EV certs no longer grant instant
reputation.

## Architecture decision

The Certum "in the Cloud" (SimplySign) certificate only exists on a logged-in
Windows machine, so it **cannot run in GitHub Actions**. Auto-update
(electron-updater) also requires the *signed* installer to be the exact file
hashed into `latest.yml` + `.blockmap`, so signing must happen **during**
electron-builder packaging. Therefore:

- **Real releases** are built + signed + published **locally on Windows** via
  `npm run release`.
- **CI** (`release.yml`) becomes **build-check only** — it builds to catch
  breakage and uploads an *unsigned* artifact for testing, but never publishes.
- **`electron-builder.yml` stays unsigned**; signing options are injected only in
  the local release path via `-c` CLI overrides, so CI never tries (and fails) to
  sign.

---

## Phase 0 — Buy & validate the certificate (do this first; ~days)

1. Buy **Certum Standard Code Signing in the Cloud**, **3-year term**, for the
   **company (OV)** — cheapest via reseller **SSLmentor** (~$108–116/yr). At
   checkout confirm it's the **"in Cloud" / SimplySign** variant (virtual smart
   card, **no USB token**), not a token SKU.
   - Do NOT buy the *Individual* SKU (signs as a person, not FFStudios) or the EV
     SKU (2× price, zero SmartScreen benefit now).
2. Complete **organization validation** (Chilean company registration + Certum
   callback/verification). This is the long pole — start immediately.
3. Record the exact **"Issued to" subject (CN)** on the issued certificate.

## Phase 1 — Set up the Windows release machine (one-time)

1. Install **SimplySign Desktop** and **proCertum CardManager** from Certum.
2. Install and pair the **SimplySign mobile app** (your OTP device).
3. Log in via SimplySign Desktop + mobile OTP → mounts the cert as a **virtual
   smart card** in the Windows store. Verify: `certutil -user -store My` lists it.

## Phase 2 — Apply the build-system changes

### 2a. Add `scripts/release.mjs`

```js
// Local, signed release for Boly.
//
// WHY THIS EXISTS:
//   The Certum "in the Cloud" (SimplySign) certificate only lives on your
//   Windows machine while SimplySign Desktop is logged in, so it CANNOT run in
//   GitHub Actions. Auto-update (electron-updater) also requires the *signed*
//   installer to be the exact file hashed into latest.yml + .blockmap, which
//   means signing must happen DURING electron-builder packaging (not after).
//   So real releases are built + signed + published from here, locally.

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
```

### 2b. Add the `release` script to `package.json`

Under `"scripts"`, after `build:linux` (add a comma to that line):

```json
    "release": "node scripts/release.mjs"
```

### 2c. Downgrade CI to build-check in `.github/workflows/release.yml`

Replace the `Publish to GitHub Releases` and `Upload to S3` steps with:

```yaml
      # Build-check only. Real releases are built, SIGNED (Certum SimplySign),
      # and published from a local Windows machine via `npm run release`.
      # See SIGNING-MIGRATION.md. CI never publishes because it has no signing
      # cert, and shipping unsigned installers would break auto-update + SmartScreen.
      - name: Package installer (no publish)
        run: npx electron-builder --win --publish never

      - name: Upload installer artifact (for testing only)
        uses: actions/upload-artifact@v4
        with:
          name: boly-${{ needs.check-version.outputs.version }}-unsigned
          path: dist_new/boly-${{ needs.check-version.outputs.version }}-setup.exe
          if-no-files-found: error
```

### 2d. Wire the cert name in

Set the cert subject once — edit `CERTUM_SUBJECT` in `scripts/release.mjs`, or
`set CERTUM_SUBJECT=Your Company Legal Name` per shell. Also have `GH_TOKEN` set
(repo write) and optionally `RELEASE_S3_BUCKET`.

## Phase 3 — First signed release

1. Bump `version` in `package.json`, commit.
2. On Windows, ensure **SimplySign Desktop is logged in**.
3. Run `npm run release`. Enter the **Certum card PIN** when prompted.
4. Verify: `signtool verify /pa /v dist_new\boly-<version>-setup.exe` → valid
   chain, signer = FFStudios.
5. Test **auto-update** from a previously installed build.
6. Submit the signed installer to Microsoft's **Security Intelligence portal**
   for review (only documented lever to nudge SmartScreen reputation).

## Expectations

- **Immediately:** UAC/Properties show "Verified publisher: FFStudios"; clean
  installs start counting toward reputation.
- **SmartScreen blue popup:** may still appear on the first signed builds — no
  fixed timeline (Microsoft publishes none). Fades over roughly **weeks to a
  couple months** of clean installs; once the cert has reputation, new signed
  releases inherit it and largely stop warning. Keep the **same cert** across
  releases — don't re-key.

## Renewal

3-year purchase = prepaid; Certum reissues within the term (code-signing certs
cap at ~459 days validity as of 2026). Renew/reissue rather than starting a fresh
order, keeping the same key if possible, to preserve reputation. Calendar-remind
~1 month before each expiry.

## Rollback

To return to the old flow: revert 2a–2c (restore the `Publish to GitHub Releases`
+ `Upload to S3` steps in `release.yml`, remove the `release` script, delete
`scripts/release.mjs`).

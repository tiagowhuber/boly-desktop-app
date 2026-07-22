# Releasing Boly (signed)

Boly installers are **code-signed with a Certum Standard OV "in the Cloud"
(SimplySign)** certificate so Windows shows the publisher name instead of the red
SmartScreen *"Publisher: Unknown"* banner, and so the app accrues SmartScreen
reputation over time.

> **Reality check:** signing does **not** make the SmartScreen warning vanish
> instantly. For a non-US/EU entity there is no instant fix in 2026 (EV certs
> lost that power in 2024, and Azure Trusted Signing is US/CA/EU/UK-only).
> Signing removes the *"Unknown publisher"* scare and starts building reputation;
> the warning fades as clean installs accumulate. Keep the **same certificate**
> across releases so reputation compounds.

Because the SimplySign cert only exists on a logged-in Windows machine and can't
run in CI, **real releases are built, signed, and published locally**. GitHub
Actions only does a build-check (it produces an *unsigned* artifact for testing
and never publishes).

---

## One-time setup

### 1. Buy & validate the certificate

1. Purchase **Certum Standard Code Signing in the Cloud** (cheapest via resellers
   such as SSLmentor, ~$108–130/yr). Buy for the **company** (OV), not an individual.
2. Complete **organization validation**: Certum verifies the Chilean company
   registration and usually does a callback/verification. This takes a few days —
   start it first; everything else waits on it.
3. Note the exact **subject / "Issued to"** name on the issued certificate
   (e.g. the company legal name). You need it verbatim below.

### 2. Install SimplySign on the release Windows machine

1. Install **SimplySign Desktop** and **proCertum CardManager** from Certum.
2. Install the **SimplySign mobile app** and pair it (this is your OTP device).
3. Log in via SimplySign Desktop + mobile OTP — this mounts your cloud cert as a
   **virtual smart card** in the Windows certificate store.
4. Confirm the cert is visible: `certutil -user -store My` should list it.

### 3. Wire the cert name into the release

Set the certificate subject once. Either edit `scripts/release.mjs`
(`const CERTUM_SUBJECT = ...`) or export it per shell:

```powershell
set CERTUM_SUBJECT=Your Company Legal Name
```

### 4. Tokens / optional S3

- `GH_TOKEN` — a GitHub token with **write** access to `tiagowhuber/boly-desktop-app`
  (electron-builder uses it to publish the release). `set GH_TOKEN=ghp_xxx`.
- `RELEASE_S3_BUCKET` *(optional)* — set to also mirror the installer to
  `s3://<bucket>/boly-Setup.exe` (the "latest download" the site serves). Requires
  the `aws` CLI + credentials configured locally. Omit to skip.

---

## Cutting a release

1. Bump `version` in `package.json` and commit.
2. On the Windows machine, make sure **SimplySign Desktop is logged in**.
3. Run:

   ```powershell
   npm run release
   ```

   This runs typecheck → `electron-vite build` → `electron-builder --win --publish always`
   with the Certum signing options injected. During packaging, signtool uses the
   virtual smart card — **you'll get a PIN prompt from the Certum card**; enter it.
   electron-builder then uploads the **signed** installer + `latest.yml` +
   `.blockmap` to GitHub Releases (and to S3 if configured).

4. Verify the signature:

   ```powershell
   signtool verify /pa /v dist_new\boly-<version>-setup.exe
   ```

   You should see a valid chain and your company name as the signer.

5. Test **auto-update** end-to-end from a previously installed build — confirm the
   updater accepts the new signed installer (publisher name must match).

---

## After the first signed release — accelerate reputation

- Submit the signed installer to Microsoft's **Security Intelligence portal** as a
  file review — the only documented lever to nudge SmartScreen reputation.
- Keep shipping with the **same cert**; don't re-key between releases.

## Renewal

Certs issued after March 2026 max out at **458 days** validity. Set a calendar
reminder ~1 month before expiry to renew and update `CERTUM_SUBJECT` if the
subject changes.

---

## How CI differs (build-check only)

`.github/workflows/release.yml` builds on version bumps to catch breakage and
uploads an **unsigned** `*-setup.exe` as a CI artifact for testing. It does
**not** publish to GitHub Releases or S3 — that only happens locally via
`npm run release`, so users only ever receive signed installers.

## How licensing works

When a user launches a game from the Boly desktop app:

1. The desktop app asks the API for a **session key** (`POST /v1/validate`,
   authenticated with the user's JWT) and receives a short-lived `tempKey`.
2. The desktop app spawns the game executable with command-line arguments:

   ```
   -game_id <int>   the game id on the platform
   -key <hex>       the session key (the credential)
   -token <jwt>     LEGACY ONLY — still sent today for backwards compatibility;
                    new games must ignore it (see "Completing the migration")
   ```

3. The game **heartbeats** the API to keep the session alive.

### The heartbeat endpoint

```
POST https://ffstudios-shop-api.vercel.app/v1/validate/validate
Content-Type: application/json
(NO Authorization header — the key is the credential)

{ "game_id": <int>, "key": "<the -key value>" }
```

| Response | Meaning | Game must |
|---|---|---|
| `200 { "state": true, "subscriptionAccess": bool }` | Session valid, TTL renewed | Keep playing |
| `403 { "state": false, ... }` | Key invalid, **superseded by another machine**, expired, or access lost | **Quit** |
| `429` | Rate limited | Back off, retry next interval; quit only after repeated failures |
| network error | Offline / unreachable | Tolerate ~2 misses, then quit |

The server key TTL is **3 minutes**. The game must heartbeat well inside that —
**every ~60 seconds** — starting at launch and repeating for the whole session.

A `403 / state:false` is the normal signal that the user started the game on
**another computer** (only one active session is allowed) or that their access
lapsed. The game **must exit** in that case.

---

## Part 1 — Migrate an OLD (legacy) game to the heartbeat

Old games still run today (the desktop app keeps sending `-token`), but they
don't heartbeat. To give a shipped game single-session + offline-expiry, rebuild
it with the script in this folder.

1. **Open the game project** in its engine.
2. **Replace** the old `ParamsCatcher` script/actor with the matching file from
   this folder (see the table at the top).
3. **Set `gameId`** in the script to this game's id on the Boly platform (the
   same value the platform sends as `-game_id`).
4. **Remove any remaining dependency on `-token`.** The new script does not read
   it, send it, or set an `Authorization` header — confirm nothing else does.
5. **Confirm the heartbeat object runs first and persists.** It must exist in the
   first loaded scene/level and survive scene loads (Unity: `DontDestroyOnLoad`;
   Godot: autoload / persistent node; Unreal: an actor not destroyed on level
   change). See [`GUIA_PARAMS_CATCHER.md`](./scripts/GUIA_PARAMS_CATCHER.md).
6. **Build the executable** for the target platform(s).
7. **Test** (see [Testing](#testing-a-build)) — verify it launches, loads the
   game, heartbeats every ~60 s, and **quits** when a second machine launches the
   same account.
8. **Upload the new build yourself on the dev dashboard** — log in at
   [boly.cl](https://boly.cl) with your developer account, open your game's page,
   **Manage builds**, and upload the zip there. An admin reviews and approves it;
   once approved it becomes the game's live version automatically. Users get it on
   their next install/update.
9. **Mark the game as migrated** in your tracking list (needed for Part 2).

When **every** game on the platform has completed steps 1–9, do Part 2.

---

## Part 2 — Completing the migration (drop `-token`, close the JWT leak)

Today the desktop app still passes `-token <jwt>` on the command line so legacy
games keep working. A command line is world-readable to any local process
(`ps`, Task Manager), so the JWT leaks. Once **all** games heartbeat with `-key`
alone, remove the token:

1. Confirm **all** games are migrated (Part 1 done for each).
2. In **`src/main/services/GameService.ts`**, find the `args` line:

   ```ts
   const args = `-game_id ${reqValidate.game_id} -key ${validationResponse.data.tempKey} -token ${token}`
   ```

   and drop the token:

   ```ts
   const args = `-game_id ${reqValidate.game_id} -key ${validationResponse.data.tempKey}`
   ```

3. Build and publish the desktop app (`npm run build` → the
   `.github/workflows/release.yml` GitHub Release, or `npm run build:win` /
   `:mac` / `:linux`).
4. Verify a game still launches and that `ps aux | grep <game>` shows **no JWT**
   in the command line.
5. Done — the argv JWT leak is closed and single-session is enforced everywhere.

> If a not-yet-migrated game remains, dropping `-token` makes it quit on launch
> (its old ParamsCatcher requires the token). That's why Part 2 happens only
> after every game is confirmed migrated. For a long mixed transition, gate
> `-token` per game instead (e.g. a `legacy_validation` flag on the game record).

---

## Part 3 — Integrate the heartbeat in a NEW game

0. **Register your Boly developer account.** Sign up at
   [boly.cl](https://boly.cl) using the **email Boly pre-approved for you** — this
   automatically creates you as a Developer account linked to your studio (no
   separate "developer request" step needed). If you don't have a game id yet
   (you create the game in step 5), use any placeholder (e.g. `0`) for steps 1–4;
   the desktop app always sends the real id at runtime, so the hardcoded value in
   your script only matters for local testing.
1. Copy the script for your engine from the `scripts/` folder into the game project:
   - Unity → [`ParamsCatcherUNITY.md`](./scripts/ParamsCatcherUNITY.md) (save as `ParamsCatcher.cs`)
   - Godot → [`ParamsCatcherGODOT.md`](./scripts/ParamsCatcherGODOT.md) (save as `ParamsCatcher.gd`)
   - Unreal → [`ParamsCatcherUNREAL.h.md`](./scripts/ParamsCatcherUNREAL.h.md) + [`ParamsCatcherUNREAL.cpp.md`](./scripts/ParamsCatcherUNREAL.cpp.md) (save as `ValidationSubsystem.h` / `.cpp`)
2. Set `gameId` to this game's platform id (or the placeholder from step 0).
3. Wire up the scene/build setup per [`GUIA_PARAMS_CATCHER.md`](./scripts/GUIA_PARAMS_CATCHER.md)
   so the validator runs in the first scene and persists across scene loads.
4. Build and test (see below).
5. **Publish the game and upload your build on the dev dashboard.** Log in at
   boly.cl, go to your **Developer Dashboard → Publish a new game**, fill in the
   game's name/description/price, and attach your zipped Windows build (the
   desktop app extracts it itself — no installer needed). This creates the game
   as a **private draft** and starts the upload; nothing is visible on the store
   yet. An admin reviews and approves the build — once approved, the game
   publishes automatically and is playable from the platform. For later updates,
   use **Manage builds** on the game's dashboard page instead (same review flow).

### Contract the script must follow (already implemented in the provided files)
- Read `-game_id` and `-key`; **do not** read or require `-token`.
- POST `{ game_id, key }` to the heartbeat URL with **no** `Authorization` header.
- Heartbeat every ~60 s; on first success enter gameplay; on `403` / repeated
  failure, **quit**.
- The heartbeat object must persist across scene/level changes.

---

## Testing a build

**Fastest — the local verifier (no upload, no platform account needed):** use the
CLI in [`verifier/`](./verifier/). It runs a local fake of the validate endpoint,
launches your build pointed at it, and checks the whole heartbeat contract
(request shape, no `Authorization` header, steady cadence, quit-on-`403`,
transient tolerance) in seconds — so you can confirm the integration **before**
uploading the build on the dev dashboard.

```bash
cd verifier
# Game devs (Windows, no Node needed): just run the prebuilt binary
verifier\dist\boly-verify-win.exe --game "C:\path\to\YourGame.exe" --game-id <id>
# (Boly maintainers with Node can also run: node verify.js --game ... --game-id <id>)
```

It relies on two **test-only** command-line overrides the scripts in this folder
now accept (the production launcher never sends them, so production behavior is
unchanged):

| Override | Default | Purpose |
|---|---|---|
| `-api_base <origin>` | `https://ffstudios-shop-api.vercel.app` | Point the heartbeat at a different host (the verifier's local mock). The script still appends `/v1/validate/validate`. |
| `-heartbeat_seconds <n>` | `60` | Shorten the heartbeat interval so the verifier finishes in seconds. |

See [`verifier/README.md`](./verifier/README.md) for all options and how to read
the report. Test an actual **build** (not the editor — see the note below).

**Easiest — through the Boly desktop app:** install the game on an account that
owns it (or has an active subscription) and launch it. Watch the game's log:

- It should load gameplay and log a successful heartbeat about every 60 s.
- Launch the **same account's** copy on a **second machine**; the first instance
  should quit within one heartbeat (single-session).
- Sign out / let the subscription lapse; the game should quit within a heartbeat.

**Advanced — manual key:** get a key yourself by calling `POST /v1/validate` with
`Authorization: Bearer <a logged-in account's JWT>` and `{ "game_id": <id> }`; it
returns `{ "tempKey": "..." }`. Then run the build with
`-game_id <id> -key <tempKey>` and watch it heartbeat.

> Note: in the Unity **editor**, `Application.Quit()` does nothing — test quit
> behavior in an actual build.

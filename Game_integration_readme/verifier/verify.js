#!/usr/bin/env node
'use strict'

// Boly game integration verifier.
//
// Launches a game build the way the Boly desktop launcher does, but against a
// local mock of the validate endpoint, and checks that the ParamsCatcher
// heartbeat is implemented per the contract (shape, headers, cadence,
// quit-on-403, transient tolerance). Run BEFORE uploading a build to Boly.
//
//   node verify.js --game <path-to-exe> --game-id <int>
//
// Zero dependencies. See README.md for full usage.

const fs = require('fs')
const { SCENARIOS } = require('./scenarios')
const report = require('./report')

function parseArgs(argv) {
  const opts = {
    game: null,
    gameId: null,
    port: 0,
    heartbeat: 3, // fast cadence for quick runs; production default is 60
    only: null,
    realCadence: false,
    json: false,
    launcher: null,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const next = () => argv[++i]
    switch (a) {
      case '--game':
      case '-g':
        opts.game = next()
        break
      case '--game-id':
        opts.gameId = parseInt(next(), 10)
        break
      case '--port':
        opts.port = parseInt(next(), 10)
        break
      case '--heartbeat':
        opts.heartbeat = parseFloat(next())
        break
      case '--only':
        opts.only = next()
          .split(',')
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !Number.isNaN(n))
        break
      case '--real-cadence':
        opts.realCadence = true
        break
      case '--launcher':
        opts.launcher = next()
        break
      case '--json':
        opts.json = true
        break
      case '--help':
      case '-h':
        opts.help = true
        break
      default:
        console.error(`Unknown argument: ${a}`)
        opts.invalid = true
    }
  }
  return opts
}

function printHelp() {
  console.log(`
Boly game integration verifier

Usage:
  node verify.js --game <path-to-exe> --game-id <int> [options]

Required:
  --game, -g <path>     Path to the built game executable to test
  --game-id <int>       The game's platform id (matches -game_id)

Options:
  --heartbeat <sec>     Test heartbeat interval (default 3). The verifier passes
                        this as -heartbeat_seconds so runs finish in seconds.
  --real-cadence        Use the real 60s heartbeat instead (slow; validates true
                        production timing). Omits -heartbeat_seconds.
  --only <list>         Run only these scenarios, e.g. --only 1,2,5
  --launcher <cmd>      Prefix command to launch the game (e.g. "wine" to run a
                        Windows .exe on Linux/macOS)
  --port <int>          Mock server port (default: auto-pick a free port)
  --json                Emit machine-readable JSON instead of the pretty report
  --help, -h            Show this help

Scenarios:
  1  Valid session — heartbeat shape, headers & cadence
  2  403 → quit
  3  Transient failure tolerated (one 5xx, recovers)
  4  Repeated failures → quit
  5  Missing -key → quit immediately, no heartbeat

Exit code is 0 only if every selected scenario passes.
`)
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))

  if (opts.help) {
    printHelp()
    process.exit(0)
  }
  if (opts.invalid || !opts.game || opts.gameId == null || Number.isNaN(opts.gameId)) {
    if (!opts.json) printHelp()
    console.error('Error: --game and --game-id are required.')
    process.exit(2)
  }
  if (!fs.existsSync(opts.game)) {
    console.error(`Error: game executable not found: ${opts.game}`)
    process.exit(2)
  }

  const heartbeat = opts.realCadence ? null : opts.heartbeat
  const intervalSec = heartbeat == null ? 60 : heartbeat
  const ctx = {
    gamePath: opts.game,
    gameId: opts.gameId,
    port: opts.port,
    heartbeat,
    intervalSec,
    launcher: opts.launcher,
  }

  const selected = opts.only
    ? SCENARIOS.filter((s) => opts.only.includes(s.id))
    : SCENARIOS

  if (selected.length === 0) {
    console.error('No scenarios selected.')
    process.exit(2)
  }

  if (!opts.json) {
    console.log(report.bold('\nBoly game integration verifier'))
    console.log(report.dim(`game:    ${opts.game}`))
    console.log(report.dim(`game-id: ${opts.gameId}`))
    console.log(
      report.dim(
        `cadence: ${opts.realCadence ? '60s (real)' : `${intervalSec}s (test)`} — this run takes ~${estimateSeconds(selected, intervalSec)}s`,
      ),
    )
  }

  const results = []
  for (let i = 0; i < selected.length; i++) {
    const s = selected[i]
    const res = await s.run(ctx)
    res.id = s.id
    results.push(res)
    if (!opts.json) {
      report.printScenarioHeader(i + 1, selected.length, res.title)
      report.printChecks(res.checks)
      if (res.sampleBeat) report.printSampleBeat(res.sampleBeat)
    }
  }

  if (opts.json) {
    console.log(
      JSON.stringify(
        {
          game: opts.game,
          gameId: opts.gameId,
          scenarios: results.map((r) => ({
            id: r.id,
            title: r.title,
            failed: r.failed,
            checks: r.checks,
          })),
          passed: results.every((r) => !r.failed),
        },
        null,
        2,
      ),
    )
  } else {
    report.printSummary(results)
  }

  process.exit(results.every((r) => !r.failed) ? 0 : 1)
}

function estimateSeconds(selected, intervalSec) {
  // Rough upper bound: most scenarios wait ~3-4 intervals.
  return Math.round(selected.length * (intervalSec * 4 + 5))
}

main().catch((err) => {
  console.error('Verifier crashed:', err)
  process.exit(3)
})

import { protocol, net } from 'electron'
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import { InstallerService } from './InstallerService'

// Serves an installed browser-style build (Unity WebGL, Godot HTML5, a plain
// web bundle) from disk under its own scheme:
//
//   boly-game://<gameId>/index.html
//   boly-game://<gameId>/assets/index-abc.js
//
// Why a custom scheme rather than file:// or a localhost server:
//   * file:// gives every page an opaque origin, so fetch(), WebAssembly
//     streaming and IndexedDB — all of which a modern engine expects — are
//     either blocked or degraded.
//   * a localhost HTTP server opens a port, which trips the Windows Firewall
//     prompt on first run. In a school lab that is exactly the kind of friction
//     that gets the app blocked.
//
// Registered as `standard`, so the game is the URL's HOST and absolute paths
// like "/assets/app.js" resolve against it. That is what lets a Vite build
// (which emits absolute asset paths by default) work untouched.
//
// The host is "game-<id>", never a bare id: a standard scheme gets IPv4 host
// parsing, so a purely numeric host is read as an IP address — "999" silently
// normalises to "0.0.3.231" and never matches anything. The prefix keeps the
// host a plain name.
export const LOCAL_GAME_SCHEME = 'boly-game'

const HOST_PREFIX = 'game-'

const hostForGame = (gameId: number): string => `${HOST_PREFIX}${gameId}`

// Inverse of hostForGame. Hostnames arrive lowercased from the URL parser.
const gameIdFromHost = (hostname: string): number | null => {
  if (!hostname.startsWith(HOST_PREFIX)) return null
  const raw = hostname.slice(HOST_PREFIX.length)
  if (!/^\d+$/.test(raw)) return null
  const parsed = Number(raw)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.htm': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.data': 'application/octet-stream',
  '.mem': 'application/octet-stream',
  '.symbols': 'application/octet-stream',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.txt': 'text/plain',
  '.xml': 'application/xml'
}

// Unity names its WebGL output after the compression picked at build time and
// expects the server to advertise it, exactly as a web host would; without the
// header the engine fails with "Unable to parse ...". Stripping the extension
// first means ".data.br" is still typed as .data.
const CONTENT_ENCODINGS: Record<string, string> = {
  '.br': 'br',
  '.gz': 'gzip'
}

export class LocalGameServer {
  private static instance: LocalGameServer
  // gameId -> the folder its build was extracted into. Only games in here can
  // be served at all, so a URL alone cannot reach anything on disk.
  private roots = new Map<number, string>()

  private constructor() {
    // Singleton pattern
  }

  public static getInstance(): LocalGameServer {
    if (!LocalGameServer.instance) {
      LocalGameServer.instance = new LocalGameServer()
    }
    return LocalGameServer.instance
  }

  // Must run BEFORE app.whenReady(): privileges cannot be granted to a scheme
  // once the protocol layer has started.
  public static registerScheme(): void {
    protocol.registerSchemesAsPrivileged([
      {
        scheme: LOCAL_GAME_SCHEME,
        privileges: {
          standard: true, // host + path semantics, so absolute paths resolve
          secure: true, // a secure context: WebAssembly, crypto, storage
          supportFetchAPI: true, // engines fetch their own manifests and assets
          stream: true, // range requests for audio and video
          corsEnabled: true
        }
      }
    ])
  }

  // Installs the request handler. Call once, after app is ready.
  public start(): void {
    protocol.handle(LOCAL_GAME_SCHEME, (request) => this.serve(request))
    console.log(`[LocalGameServer] serving ${LOCAL_GAME_SCHEME}:// from the games library`)
  }

  // Make a build reachable and return the URL its entry point lives at.
  // The renderer supplies the paths (it holds the install registry), so both
  // are checked here against the real games library before anything is served.
  public register(
    gameId: number,
    root: string,
    entryPath: string
  ): { ok: true; url: string } | { ok: false; error: string } {
    if (!Number.isInteger(gameId) || gameId <= 0) {
      return { ok: false, error: 'Invalid game id' }
    }

    const resolvedRoot = path.resolve(root ?? '')
    const library = path.resolve(InstallerService.getInstance().getLibraryPath())

    // A compromised or buggy renderer must not be able to point the scheme at
    // an arbitrary folder — only at something inside the games library.
    if (!this.isWithin(library, resolvedRoot)) {
      return { ok: false, error: 'Game folder is outside the games library' }
    }
    if (!fs.existsSync(resolvedRoot) || !fs.statSync(resolvedRoot).isDirectory()) {
      return { ok: false, error: 'Game folder no longer exists' }
    }

    const resolvedEntry = path.resolve(entryPath ?? '')
    if (!this.isWithin(resolvedRoot, resolvedEntry) || !fs.existsSync(resolvedEntry)) {
      return { ok: false, error: 'Game entry point no longer exists' }
    }

    this.roots.set(gameId, resolvedRoot)

    // Path of the entry point relative to the root, as URL segments.
    const relative = path.relative(resolvedRoot, resolvedEntry).split(path.sep).join('/')
    return { ok: true, url: `${LOCAL_GAME_SCHEME}://${hostForGame(gameId)}/${relative}` }
  }

  public unregister(gameId: number): void {
    this.roots.delete(gameId)
  }

  private async serve(request: Request): Promise<Response> {
    let url: URL
    try {
      url = new URL(request.url)
    } catch {
      return new Response('Bad request', { status: 400 })
    }

    const gameId = gameIdFromHost(url.hostname)
    const root = gameId === null ? undefined : this.roots.get(gameId)
    if (!root) {
      return new Response('Game not available', { status: 404 })
    }

    let requested: string
    try {
      requested = decodeURIComponent(url.pathname)
    } catch {
      return new Response('Bad request', { status: 400 })
    }

    const filePath = this.resolveWithin(root, requested)
    if (!filePath) {
      // Traversal attempt, or a path that escapes the build folder.
      return new Response('Forbidden', { status: 403 })
    }

    let target = filePath
    try {
      // A bare directory ("/" or "/sub/") means its index.html, the same as a
      // static web server would do.
      if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
        target = path.join(target, 'index.html')
      }
      if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
        return new Response('Not found', { status: 404 })
      }
    } catch {
      return new Response('Not found', { status: 404 })
    }

    try {
      const response = await net.fetch(pathToFileURL(target).toString())
      const headers = new Headers(response.headers)

      const { contentType, contentEncoding } = this.describe(target)
      headers.set('Content-Type', contentType)
      if (contentEncoding) {
        headers.set('Content-Encoding', contentEncoding)
      }

      return new Response(response.body, { status: response.status, headers })
    } catch (error) {
      console.error(`[LocalGameServer] failed to read ${target}:`, error)
      return new Response('Read error', { status: 500 })
    }
  }

  // Content type from the extension, looking past a compression suffix so
  // "game.data.br" is typed as .data and flagged as brotli-encoded.
  private describe(filePath: string): { contentType: string; contentEncoding?: string } {
    const lower = filePath.toLowerCase()
    const compressionExt = path.extname(lower)
    const contentEncoding = CONTENT_ENCODINGS[compressionExt]

    const effective = contentEncoding ? lower.slice(0, -compressionExt.length) : lower
    const contentType = MIME_TYPES[path.extname(effective)] ?? 'application/octet-stream'

    return { contentType, contentEncoding }
  }

  // Join a URL path onto the build folder, refusing anything that climbs out.
  // path.resolve collapses "..", so the containment check below catches both
  // plain and percent-encoded traversal.
  private resolveWithin(root: string, urlPath: string): string | null {
    const relative = urlPath.replace(/^\/+/, '')
    const resolvedRoot = path.resolve(root)
    const target = path.resolve(resolvedRoot, relative)
    return this.isWithin(resolvedRoot, target) ? target : null
  }

  private isWithin(parent: string, child: string): boolean {
    // Windows paths are case-insensitive; comparing raw strings would reject a
    // valid path that differs only in drive-letter or folder casing.
    const normalize = (value: string): string =>
      process.platform === 'win32' ? path.resolve(value).toLowerCase() : path.resolve(value)

    const parentNorm = normalize(parent)
    const childNorm = normalize(child)
    return childNorm === parentNorm || childNorm.startsWith(parentNorm + path.sep)
  }
}

export default LocalGameServer

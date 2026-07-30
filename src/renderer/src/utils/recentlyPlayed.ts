/**
 * Tracks the last games the user launched, so the home quick-access panel can
 * offer a one-click "continue playing" without asking the API for playtime.
 *
 * Stored locally because launching is a desktop-only event: the server records
 * playtime per session, but not "which game did this machine open last".
 */
const STORAGE_KEY = 'recentlyPlayedGames'
const MAX_ENTRIES = 8

export interface RecentlyPlayedEntry {
  gameId: number
  playedAt: number
}

export function getRecentlyPlayed(): RecentlyPlayedEntry[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(raw)) return []
    return raw
      .filter((entry) => entry && typeof entry.gameId === 'number')
      .sort((a, b) => (b.playedAt ?? 0) - (a.playedAt ?? 0))
  } catch {
    return []
  }
}

export function recordPlayed(gameId: number): void {
  if (!gameId) return
  try {
    const entries = getRecentlyPlayed().filter((entry) => entry.gameId !== gameId)
    entries.unshift({ gameId, playedAt: Date.now() })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
  } catch (error) {
    console.error('Could not record recently played game:', error)
  }
}

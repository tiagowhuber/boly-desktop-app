import bolyPlaceholder from '@/assets/svgs/bolyico.svg'

/**
 * Local fallback for game artwork that has no banner yet. Resolved through
 * Vite so it works from the packaged asar — a missing banner must not depend
 * on a network fetch.
 */
export const PLACEHOLDER_IMAGE = bolyPlaceholder

/**
 * Resolves an image path to a full URL.
 * - If the path is already a full URL (http/https), returns it as-is.
 * - If the path is relative (e.g. "GameImages/BodyDefense/banner.jpg"),
 *   prepends VITE_IMAGES_BASE_URL so the image is served from Netlify.
 */
export function resolveImageUrl(path: string | undefined | null): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = (import.meta.env.VITE_IMAGES_BASE_URL as string) || ''
  return `${base}/${path.replace(/^\/+/, '')}`
}

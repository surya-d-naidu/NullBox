/**
 * Hardening helpers: never pass unsanitized strings to Docker or trust user input as IDs/URLs.
 * Dockerode does not shell out, but malicious image refs or IDs can still cause unexpected pulls or API abuse.
 */

/**
 * Prisma primary keys in this app: default cuid() or explicit seed ids (e.g. seed_chal_web).
 * Reject anything that could be confused with injection (spaces, shell chars).
 */
const SAFE_RECORD_ID = /^[a-zA-Z0-9_-]{8,128}$/

/** Docker full ID (64 hex) or short ID (12–64 hex) */
const DOCKER_CONTAINER_ID = /^[a-f0-9]{12,64}$/i

/**
 * Docker image reference: only safe characters, no shell metacharacters.
 * Allows: registry/repo:tag, official images like nginx:alpine, digests @sha256:...
 */
const SAFE_DOCKER_IMAGE = /^[a-zA-Z0-9._\-/:]+(@sha256:[a-f0-9]{64})?$/

const BLOCKED_IN_IMAGE = /[;&|`$()<>\n\r\\]/

const MAX_IMAGE_LEN = 255
const MAX_FLAG_LEN = 2048
const MAX_TEXT_FIELD = 50_000

export function isSafeRecordId(id: string): boolean {
  return typeof id === 'string' && SAFE_RECORD_ID.test(id)
}

export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535
}

export function isSafeDockerImageReference(image: string): boolean {
  if (!image || typeof image !== 'string') return false
  const t = image.trim()
  if (t.length === 0 || t.length > MAX_IMAGE_LEN) return false
  if (BLOCKED_IN_IMAGE.test(t)) return false
  if (!SAFE_DOCKER_IMAGE.test(t)) return false
  return true
}

export function isSafeDockerContainerId(id: string): boolean {
  if (!id || typeof id !== 'string') return false
  const t = id.trim()
  return t.length >= 12 && t.length <= 64 && DOCKER_CONTAINER_ID.test(t)
}

/** Strip control characters and bound length for plain text fields */
export function sanitizePlainText(input: string, maxLen: number): string {
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').slice(0, maxLen)
}

export function assertSafeHttpsUrl(url: string): string | null {
  const t = url.trim()
  if (!t) return null
  try {
    const u = new URL(t)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    if (!u.hostname) return null
    return u.toString()
  } catch {
    return null
  }
}

export const limits = {
  maxFlagLen: MAX_FLAG_LEN,
  maxTextField: MAX_TEXT_FIELD
}

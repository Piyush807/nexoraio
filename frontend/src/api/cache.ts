const STORAGE_KEY = 'nexora.api-cache.v1'
const DEFAULT_TTL = 30_000

type CacheEntry = { value: unknown; expiresAt: number }
const memory = new Map<string, CacheEntry>()

function readStorage(): Record<string, CacheEntry> {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

function writeStorage(data: Record<string, CacheEntry>) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch { /* storage is optional */ }
}

function readEntry<T>(key: string): CacheEntry | undefined {
  const inMemory = memory.get(key)
  if (inMemory) return inMemory
  const stored = readStorage()[key]
  if (stored) memory.set(key, stored)
  return stored
}

function read<T>(key: string): T | undefined {
  const entry = readEntry<T>(key)
  return entry && entry.expiresAt > Date.now() ? entry.value as T : undefined
}

function write(key: string, value: unknown, ttl: number) {
  const entry = { value, expiresAt: Date.now() + ttl }
  memory.set(key, entry)
  const stored = readStorage()
  stored[key] = entry
  // Keep the session cache bounded.
  for (const [k, v] of Object.entries(stored)) if (v.expiresAt <= Date.now()) delete stored[k]
  writeStorage(stored)
}

export async function cachedGet<T>(key: string, fetcher: () => Promise<T>, ttl = DEFAULT_TTL): Promise<T> {
  const cached = read<T>(key)
  if (cached !== undefined) return cached
  const stale = readEntry<T>(key)?.value as T | undefined
  try {
    const fresh = await fetcher()
    write(key, fresh, ttl)
    return fresh
  } catch (error) {
    if (stale !== undefined) return stale
    throw error
  }
}

export function invalidateCache(prefix?: string) {
  if (!prefix) {
    memory.clear()
    try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* optional */ }
    return
  }
  for (const key of [...memory.keys()]) if (key.startsWith(prefix)) memory.delete(key)
  const stored = readStorage()
  for (const key of Object.keys(stored)) if (key.startsWith(prefix)) delete stored[key]
  writeStorage(stored)
}

export function clearUserCache() {
  invalidateCache()
  try {
    sessionStorage.removeItem('nexora.user-cache.v1')
    sessionStorage.removeItem('nexora.goal-draft.v1')
    for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
      const key = sessionStorage.key(i)
      if (key?.startsWith('nexora.chat-draft.v1:')) sessionStorage.removeItem(key)
    }
  } catch { /* storage is optional */ }
}

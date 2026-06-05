import Cookies from 'js-cookie'
import { COOKIE_NAME_MAP, StorageKeys, type StorageKey } from './keys'

const isServer = globalThis.window === undefined

// Server-side cookie store: populated per-request via setServerCookies()
let serverCookies: Record<string, string> | null = null

export function setServerCookies(cookies: Record<string, string>): void {
  serverCookies = cookies
}

export function clearServerCookies(): void {
  serverCookies = null
}

function getCookieName(key: StorageKey): string | undefined {
  return COOKIE_NAME_MAP[key]
}

export function getCookie(key: StorageKey): string | null {
  const cookieName = getCookieName(key)
  if (!cookieName) return null

  if (isServer) {
    return serverCookies?.[cookieName] ?? null
  }
  return Cookies.get(cookieName) ?? null
}

export function setCookie(key: StorageKey, value: string): void {
  const cookieName = getCookieName(key)
  if (!cookieName || isServer) return

  const isJwt = key === StorageKeys.JWT_TOKEN
  Cookies.set(cookieName, value, {
    path: '/',
    sameSite: isJwt ? 'Strict' : 'Lax',
    secure: globalThis.location.protocol === 'https:',
    expires: isJwt ? 7 : 365,
  })
}

export function removeCookie(key: StorageKey): void {
  const cookieName = getCookieName(key)
  if (!cookieName || isServer) return
  Cookies.remove(cookieName, { path: '/' })
}

import type { UrlObject } from "node:url"

type RouteParamValue = string | number | null | undefined | (string | number)[]

type RouteParams = Record<string, RouteParamValue>

type RouteHrefObject = {
  pathname: string
  params?: RouteParams
  query?: RouteParams
}

type RouteHref = string | RouteHrefObject

function getRouteParams(href: RouteHrefObject): RouteParams | undefined {
  return href.params ?? href.query
}

function toUrlQuery(params: RouteParams | undefined): UrlObject["query"] {
  if (!params) {
    return undefined
  }

  const query: NonNullable<UrlObject["query"]> = {}

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue
    }

    query[key] = Array.isArray(value) ? value.map(String) : String(value)
  }

  return query
}

function toSearchParams(params: RouteParams | undefined): URLSearchParams {
  const searchParams = new URLSearchParams()

  if (!params) {
    return searchParams
  }

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, String(item))
      }
      continue
    }

    searchParams.set(key, String(value))
  }

  return searchParams
}

function toNextHref(href: RouteHref): UrlObject | string {
  if (typeof href === "string") {
    return href
  }

  return {
    pathname: href.pathname,
    query: toUrlQuery(getRouteParams(href)),
  }
}

function toExpoHref(href: RouteHref) {
  if (typeof href === "string") {
    return href
  }

  return {
    pathname: href.pathname,
    params: getRouteParams(href),
  }
}

function resolveHref(href: RouteHref): string {
  if (typeof href === "string") {
    return href
  }

  const searchParams = toSearchParams(getRouteParams(href))
  const queryString = searchParams.toString()

  if (!queryString) {
    return href.pathname
  }

  return `${href.pathname}?${queryString}`
}

export type { RouteHref, RouteHrefObject, RouteParams, RouteParamValue }
export { resolveHref, toExpoHref, toNextHref, toSearchParams }

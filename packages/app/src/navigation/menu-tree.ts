import type {
  SbfMenuTopChildTreeItemResponseDto,
  SbfMenuTopTreeItemResponseDto,
  SbfMenuTreeItemResponseDto,
} from "@workspace/api-client"

export type TopBarMenuNode =
  | SbfMenuTopTreeItemResponseDto
  | SbfMenuTopChildTreeItemResponseDto
export type FlatMenuNode = SbfMenuTreeItemResponseDto

type RouteMenuNode = {
  route?: string
}

type TreeMenuNode = RouteMenuNode & {
  children?: unknown
}

export function isRouteActive(
  pathname: string | undefined,
  href: string
): boolean {
  if (!pathname) {
    return false
  }
  if (href === "/") {
    return pathname === "/"
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function getMenuChildren<T extends TreeMenuNode>(
  node: T | undefined
): T[] {
  return Array.isArray(node?.children) ? (node.children as T[]) : []
}

export function hasMenuChildren<T extends TreeMenuNode>(
  node: T | undefined
): boolean {
  return getMenuChildren(node).length > 0
}

export function isMenuRouteActive(
  node: RouteMenuNode | undefined,
  pathname: string
): boolean {
  if (!node?.route) {
    return false
  }
  return isRouteActive(pathname, node.route)
}

export function getFlatMenuItems(
  items: FlatMenuNode[] | undefined
): FlatMenuNode[] {
  return items ?? []
}

export function getNavigableFlatMenuItems(
  items: FlatMenuNode[] | undefined
): Array<FlatMenuNode & { route: string }> {
  return getFlatMenuItems(items).filter(
    (item): item is FlatMenuNode & { route: string } => Boolean(item.route)
  )
}

export function hasActiveMenuItems<T extends TreeMenuNode>(
  items: T[],
  pathname: string
): boolean {
  for (const item of items) {
    if (isMenuTreeActive(item, pathname)) {
      return true
    }
  }
  return false
}

export function isMenuTreeActive<T extends TreeMenuNode>(
  node: T | undefined,
  pathname: string
): boolean {
  if (!node) {
    return false
  }
  return (
    isMenuRouteActive(node, pathname) ||
    hasActiveMenuItems(getMenuChildren(node), pathname)
  )
}

export function getLeafMenuItems<T extends TreeMenuNode>(nodes: T[]): T[] {
  const items: T[] = []

  for (const node of nodes) {
    const children = getMenuChildren(node)

    if (children.length > 0) {
      items.push(...getLeafMenuItems(children))
      continue
    }

    if (node.route) {
      items.push(node)
    }
  }

  return items
}

export function getFirstNavigableMenuItem<T extends TreeMenuNode>(
  nodes: T[]
): T | undefined {
  for (const node of nodes) {
    if (node.route) {
      return node
    }

    const child = getFirstNavigableMenuItem(getMenuChildren(node))

    if (child) {
      return child
    }
  }

  return undefined
}

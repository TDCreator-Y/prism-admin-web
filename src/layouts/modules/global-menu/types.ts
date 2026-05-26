import type { RouteRecordRaw, RouteMeta } from 'vue-router'

/** 菜单项接口 */
export interface MenuItem {
  /** 唯一标识 */
  key: string
  /** 路由路径 */
  path: string
  /** 菜单标题 */
  title: string
  /** 图标类名 */
  icon?: string
  /** 描述文字（来自 UMD componentsDetailed.description） */
  description?: string
  /** 子菜单 */
  children?: MenuItem[]
  /** 是否隐藏 */
  hidden?: boolean
  /** 是否总是展开 */
  alwaysShow?: boolean
  /** 父级路径（用于构建完整路径） */
  parentPath?: string
  /** 元数据 */
  meta?: RouteMeta
  /** 重定向地址 */
  redirect?: string
  /** 功能路由ID（用于动态路由） */
  routeId?: string
}

/** 菜单配置 */
export interface MenuConfig {
  /** 是否显示完整路径 */
  showFullPath?: boolean
  /** 是否开启手风琴模式 */
  accordion?: boolean
  /** 默认展开的菜单 keys */
  defaultOpenKeys?: string[]
  /** 默认选中的菜单 key */
  defaultSelectedKey?: string
  /** 是否折叠菜单 */
  collapsed?: boolean
}

/** 主题配置 */
export interface ThemeConfig {
  /** 布局模式: side-侧边栏, top-顶部菜单, mix-混合布局 */
  layout: 'side' | 'top' | 'mix'
  /** 主题色 */
  primaryColor: string
  /** 是否暗色模式 */
  darkMode: boolean
  /** 侧边栏宽度 */
  siderWidth: number
  /** 是否显示标签页 */
  showTabs: boolean
  /** 是否显示面包屑 */
  showBreadcrumb: boolean
  /** 是否显示页脚 */
  showFooter: boolean
  /** 是否显示全屏水印 */
  showWatermark: boolean
  /** 水印文案 */
  watermarkText: string
  /** 关闭全部/左侧/右侧时是否保留首页标签 */
  preserveHomeTab: boolean
}

/** 将路由转换为菜单项 */
export function transformRouteToMenu(routes: RouteRecordRaw[], parentPath = ''): MenuItem[] {
  const menu: MenuItem[] = []

  for (const route of routes) {
    // 跳过隐藏的路由
    if (route.meta?.hidden === true) {
      continue
    }

    // 如果路径已经是绝对路径（以 / 开头），直接使用；否则拼接父路径
    let fullPath: string
    if (route.path.startsWith('/')) {
      fullPath = route.path
    } else if (parentPath) {
      fullPath = `${parentPath}/${route.path}`
    } else {
      fullPath = route.path
    }

    const menuItem: MenuItem = {
      key: route.name as string || route.path,
      path: fullPath,
      title: (route.meta?.title as string) || route.name as string || route.path,
      icon: route.meta?.icon as string,
      description: route.meta?.description as string | undefined,
      hidden: route.meta?.hidden as boolean,
      alwaysShow: route.meta?.alwaysShow as boolean,
      meta: route.meta,
      parentPath,
      redirect: route.redirect as string,
    }

    // 递归处理子路由
    if (route.children && route.children.length > 0) {
      const children = transformRouteToMenu(route.children, fullPath)
      // 如果有子菜单且不是总是显示，则过滤掉没有子菜单的项
      menuItem.children = children.filter(child => !child.hidden)
    }

    menu.push(menuItem)
  }

  return menu
}

/** 按 key 在菜单树中查找菜单项 */
export function findMenuByKey(menu: MenuItem[], key: string): MenuItem | undefined {
  for (const item of menu) {
    if (item.key === key) return item;
    if (item.children) {
      const found = findMenuByKey(item.children, key);
      if (found) return found;
    }
  }
  return undefined;
}

/** 按 path 在菜单树中查找菜单项 */
export function findMenuByPath(menu: MenuItem[], path: string): MenuItem | undefined {
  for (const item of menu) {
    if (item.path === path) return item;
    if (item.children) {
      const found = findMenuByPath(item.children, path);
      if (found) return found;
    }
  }
  return undefined;
}

/** 扁平化菜单（用于标签页） */
export function flattenMenu(menu: MenuItem[]): MenuItem[] {
  const result: MenuItem[] = []

  for (const item of menu) {
    result.push(item)
    if (item.children && item.children.length > 0) {
      result.push(...flattenMenu(item.children))
    }
  }

  return result
}

/** 查找菜单项的所有父级路径 */
export function findMenuParents(menu: MenuItem[], path: string, parents: MenuItem[] = []): MenuItem[] {
  for (const item of menu) {
    if (item.path === path) {
      return parents
    }
    if (item.children) {
      const found = findMenuParents(item.children, path, [...parents, item])
      if (found.length > 0) {
        return found
      }
    }
  }
  return []
}

import type { MenuItem } from './types';
import { fetchMenuData } from './menu-service';
import { getGlobalConfig } from './global-config';

export interface TreeStats {
  maxDepth: number;
  totalNodes: number;
  leafCount: number;
  containerCount: number;
  functionCount: number;
}

// 获取根菜单
export async function getRootMenu(): Promise<MenuItem[]> {
  const config = getGlobalConfig();
  const response = await fetchMenuData(config.InternalCode);
  return response.MenusMain.Results;
}

export function getMenuTree(items: MenuItem[]): MenuItem[] {
  if (!items || items.length === 0) return [];

  const itemRouteIds = new Set(items.map(item => item.routeId));

  const rootItems = items.filter(item => {
    const parentRouteId = item.ParentRouteId;
    return parentRouteId == null || parentRouteId === '' || !itemRouteIds.has(parentRouteId);
  });

  function buildChildren(parentRouteId: string): MenuItem[] {
    const children = items.filter(item => item.ParentRouteId === parentRouteId);
    children.forEach(child => {
      child.Children = buildChildren(child.routeId);
    });
    return children;
  }

  rootItems.forEach(item => {
    item.Children = buildChildren(item.routeId);
  });

  return rootItems;
}

// 统计分析
export function analyzeTree(items: MenuItem[], depth = 1): TreeStats {
  let maxDepth = depth;
  let totalNodes = 0;
  let leafCount = 0;
  let containerCount = 0;
  let functionCount = 0;

  function traverse(nodes: MenuItem[], currentDepth: number) {
    nodes.forEach(node => {
      totalNodes++;
      maxDepth = Math.max(maxDepth, currentDepth);

      const hasChildren = node.Children && node.Children.length > 0;
      const hasFunction = !!node.FunctionId;

      if (hasChildren) {
        containerCount++;
        traverse(node.Children!, currentDepth + 1);
      }
      if (hasFunction || !hasChildren) {
        leafCount++;
      }
      if (hasFunction) {
        functionCount++;
      }
    });
  }

  traverse(items, depth);

  return {
    maxDepth,
    totalNodes,
    leafCount,
    containerCount,
    functionCount,
  };
}

import { defineStore } from 'pinia';
import { createThemeDomain } from './theme-domain';
import { createMenuDomain } from './menu-domain';
import { createTabsDomain } from './tabs-domain';

export const useMenuStore = defineStore('menu', () => {
  const themeDomain = createThemeDomain();
  const menuDomain = createMenuDomain(themeDomain.theme);
  const tabsDomain = createTabsDomain({
    menuList: menuDomain.menuList,
    theme: themeDomain.theme,
  });

  function setTheme(config: Partial<typeof themeDomain.theme.value>) {
    themeDomain.setTheme(config);
    if (config.layout === 'mix' && menuDomain.selectedKey.value) {
      menuDomain.syncMixActiveRoot(menuDomain.selectedKey.value);
    }
  }

  function resetState() {
    menuDomain.resetMenuState();
    tabsDomain.resetTabsState();
  }

  return {
    menuList: menuDomain.menuList,
    openKeys: menuDomain.openKeys,
    selectedKey: menuDomain.selectedKey,
    tabsList: tabsDomain.tabsList,
    theme: themeDomain.theme,
    menuConfig: menuDomain.menuConfig,
    siderCollapsed: menuDomain.siderCollapsed,
    mixActiveRootKey: menuDomain.mixActiveRootKey,
    mixHeaderMenuList: menuDomain.mixHeaderMenuList,
    mixSiderMenuList: menuDomain.mixSiderMenuList,
    breadcrumbs: menuDomain.breadcrumbs,
    setMenuFromRoutes: menuDomain.setMenuFromRoutes,
    setSelectedKey: menuDomain.setSelectedKey,
    addTab: tabsDomain.addTab,
    removeTab: tabsDomain.removeTab,
    removeOtherTabs: tabsDomain.removeOtherTabs,
    removeLeftTabs: tabsDomain.removeLeftTabs,
    removeRightTabs: tabsDomain.removeRightTabs,
    removeAllTabs: tabsDomain.removeAllTabs,
    setSiderCollapsed: menuDomain.setSiderCollapsed,
    toggleSider: menuDomain.toggleSider,
    setMixActiveRoot: menuDomain.setMixActiveRoot,
    toggleDarkMode: themeDomain.toggleDarkMode,
    setTheme,
    updateColorVariables: themeDomain.updateColorVariables,
    toggleOpenKey: menuDomain.toggleOpenKey,
    openKey: menuDomain.openKey,
    closeAllKeys: menuDomain.closeAllKeys,
    resetState,
  };
});


import type { Config } from './remote-component-types';

// [MOCK MODE] 直接返回本地配置，无需后端请求。
// 恢复后端连接时：使用 bridgeClient.request.get<Config>(_configPath) 获取并返回远程配置。
export const loadConfig = async (_configPath: string): Promise<Config> => {
  return {
    components: [
      {
        name: 'CrmUmd',
        type: 'umd',
        version: '1.0.0',
        path: '/umd/crm-component.umd.js',
        globalName: 'VueComponent',
        autoRegister: true,
        metadata: {
          zhName: 'CRM 业务套件',
          // 这些 UMD 包已经内联编译后的样式，宿主 Tailwind 不再扫描 public/umd。
          // 如后续引入未内联样式的新远程组件，需要显式补充宿主 safelist 或改为组件自带样式。
        },
      },
      {
        name: 'DashboardStandards',
        type: 'umd',
        version: '1.0.0',
        path: '/umd/dashboard-umd-standards.js',
        globalName: 'VueComponent',
        autoRegister: true,
        metadata: {
          zhName: '仪表盘标准组件',
        },
      },
    ],
  };
};

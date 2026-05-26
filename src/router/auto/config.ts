// 自动生成的路由配置文件
export const routeConfig = {
  "base": {
    "pathPrefix": "",
    "lazy": true,
    "meta": {}
  },
  "meta": {
    "defaultTitle": ""
  },
  "autoRoute": {
    "scanDir": "src/views",
    "extensions": [
      ".vue"
    ],
    "exclude": [
      "**/components/**",
      "**/__tests__/**",
      "**/node_modules/**",
      "**/.git/**",
      "**/dist/**",
      "**/build/**"
    ],
    "naming": {
      "kebabCase": false,
      "preservePath": false,
      "filenameSuffixes": []
    }
  },
  "notFound": {
    "enabled": true,
    "path": "/:pathMatch(.*)*",
    "name": "not-found",
    "component": "src/views/404.vue"
  }
}

export default routeConfig

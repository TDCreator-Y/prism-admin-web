// 统一维护前端使用的接口路径，避免页面组件内散落硬编码。
// 如果后端后续调整登录地址，只需修改环境变量或此默认值。
export const AUTH_LOGIN_ENDPOINT = import.meta.env.VITE_AUTH_LOGIN_ENDPOINT || '/api/auth/login.json';

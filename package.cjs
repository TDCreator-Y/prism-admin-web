const fs   = require('fs');
const path = require('path');

const pkgPath = path.resolve(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

/* -------------------------------------------------
 * 分组及组内顺序（含 email）
 * -------------------------------------------------*/
const sections = {
  /* 1️⃣ 身份与元数据 */
  identity: [
    'name', 'version', 'description', 'keywords', 'author', 'email', 'url',
    'maintainers', 'contributors', 'license', 'homepage', 'repository', 'bugs', 'funding'
  ],

  /* 2️⃣ 入口与运行时行为 */
  entry: [
    'type', 'main', 'module', 'types', 'typings', 'exports', 'imports',
    'browser', 'react-native', 'esnext', 'deno'
  ],

  /* 3️⃣ 文件与发布 */
  publish: [
    'files', 'publishConfig', 'private', 'preferGlobal'
  ],

  /* 4️⃣ 脚本与生命周期钩子 */
  scripts: ['scripts', 'config', 'husky', 'lint-staged', 'pre-commit', 'commitlint'],

  /* 5️⃣ 依赖与平台要求 */
  deps: [
    'dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies',
    'bundledDependencies', 'bundleDependencies', 'engines', 'os', 'cpu',
    'workspaces', 'overrides', 'resolutions', 'packageManager'
  ],

  /* 6️⃣ 可执行文件与扩展 */
  misc: [
    'bin', 'man', 'directories', 'sideEffects', 'deprecated', 'icon', 'displayName'
  ]
};

/* -------------------------------------------------
 * 排序函数
 * -------------------------------------------------*/
function sortBySections(obj) {
  const ordered = {};
  Object.values(sections).flat().forEach(key => {
    if (key in obj) ordered[key] = obj[key];
  });
  Object.keys(obj)
    .filter(k => !(k in ordered))
    .forEach(k => (ordered[k] = obj[k]));
  return ordered;
}

/* -------------------------------------------------
 * 写回
 * -------------------------------------------------*/
const sorted = sortBySections(pkg);
fs.writeFileSync(pkgPath, JSON.stringify(sorted, null, 2) + '\n', 'utf8');


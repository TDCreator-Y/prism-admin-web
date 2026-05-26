const remoteComponentHostSafelist = [
  // 远程组件加载状态面板会根据运行时状态切换不同的徽标样式。
  // 这里使用显式 safelist 保留宿主壳层样式，而不是扫描整个 public 目录。
  'bg-green-50',
  'text-green-700',
  'border-green-200',
  'dark:bg-green-900/20',
  'dark:text-green-400',
  'dark:border-green-800',
  'bg-yellow-50',
  'text-yellow-700',
  'border-yellow-200',
  'dark:bg-yellow-900/20',
  'dark:text-yellow-400',
  'dark:border-yellow-800',
  'bg-red-50',
  'text-red-700',
  'border-red-200',
  'dark:bg-red-900/20',
  'dark:text-red-400',
  'dark:border-red-800',
  'bg-gray-50',
  'text-gray-700',
  'border-gray-200',
  'dark:bg-gray-800',
  'dark:text-gray-400',
  'dark:border-gray-700',
];

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  safelist: remoteComponentHostSafelist,
  theme: {
    extend: {},
  },
  plugins: [],
};

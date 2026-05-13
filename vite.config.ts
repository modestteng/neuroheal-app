import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
// 默认 `vite build` -> 普通 PWA 构建（dist/，可安装 / 可部署）
// `vite build --mode single` -> 把整个 App 打进单个 index.html（distSingle/，可直接拷给别人/手机打开）
export default defineConfig(({ mode }) => {
  const single = mode === 'single'
  return {
    plugins: [
      react(),
      ...(single
        ? [viteSingleFile()]
        : [
            VitePWA({
              registerType: 'autoUpdate',
              includeAssets: ['icon.svg'],
              manifest: {
                name: '智愈莘莘 NeuroHeal',
                short_name: 'NeuroHeal',
                description: '面向高校学生的脑电情绪监测与心理健康干预 App',
                theme_color: '#4fb6e6',
                background_color: '#f1f8fc',
                display: 'standalone',
                orientation: 'portrait',
                start_url: '.',
                scope: '.',
                lang: 'zh-CN',
                icons: [
                  { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
                  { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
                ],
              },
              workbox: {
                globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
              },
            }),
          ]),
    ],
    server: {
      proxy: {
        '/api': 'http://127.0.0.1:8787',
      },
    },
  }
})

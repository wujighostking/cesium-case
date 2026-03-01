import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

export const routesLink = [
  {
    path: '/eagle-viewer',
    name: '鹰眼图',
    component: () => import('@/views/eagle-viewer.vue'),
  },
  {
    path: '/double-window-compare',
    name: '双屏对比',
    component: () => import('@/views/double-window-compare.vue'),
  },
  {
    path: '/wind-speed',
    name: '全球风向',
    component: () => import('@/views/wind-speed.vue'),
  },
]

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: '首页',
    component: () => import('@/views/index.vue'),
  },

  ...routesLink,
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

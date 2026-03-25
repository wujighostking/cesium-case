import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

export const routesLink = [
  {
    path: '/viewer',
    name: '基础视图',
    component: () => import('@/views/viewer.vue'),
  },
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
  {
    path: '/tiles-styling',
    name: '3D 瓦片样式',
    component: () => import('@/views/tiles-styling.vue'),
  },
  {
    path: '/models',
    name: '加载模型',
    component: () => import('@/views/models.vue'),
  },
  {
    path: '/photo-sphere-viewer',
    name: '全景视图',
    component: () => import('@/views/photo-sphere-viewer.vue'),
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

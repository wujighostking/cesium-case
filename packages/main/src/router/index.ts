import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

export const routesLink = [
  {
    path: '/eagle-viewer',
    name: '鹰眼图',
    component: () => import('../views/eagle-viewer.vue'),
  },
]

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: '首页',
    component: () => import('../views/index.vue'),
  },

  ...routesLink,
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

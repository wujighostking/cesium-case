import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/eagle-viewer',
    name: 'EagleViewer',
    component: () => import('../views/eagle-viewer.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

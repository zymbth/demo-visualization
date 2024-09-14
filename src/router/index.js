import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import d3Router from './modules/d3'
import echartsRouter from './modules/echarts'

export const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [{ path: 'home', component: () => import('@/views/home.vue') }],
  },
  echartsRouter,
  d3Router,
]

const router = createRouter({
  history: createWebHashHistory(),
  // history: createWebHistory(),
  routes,
})

export default router

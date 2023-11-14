import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

export const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [{ path: 'home', component: () => import('@/views/home.vue') }],
  },
  {
    path: '/echarts',
    component: Layout,
    redirect: '/echarts/index',
    children: [
      { path: 'index', component: () => import('@/views/echarts/index.vue') },
      {
        path: 'line-bar-diagram',
        meta: { title: 'Line-Bar Diagram' },
        component: () => import('@/views/echarts/line-bar-diagram.vue'),
      },
      {
        path: 'pie-diagram',
        meta: { title: 'Pie Diagram' },
        component: () => import('@/views/echarts/pie-diagram/index.vue'),
      },
      {
        path: 'heatmap-diagram',
        meta: { title: 'Heatmap Diagram' },
        component: () => import('@/views/d3/heatmap-diagram/echarts-version.vue'),
      },
      {
        path: 'multi-grid-scatter-diagram',
        meta: { title: 'Multi-Grid Scatter Diagram' },
        component: () => import('@/views/echarts/multi-grid-scatter-diagram/index.vue'),
      },
    ],
  },
  {
    path: '/d3',
    component: Layout,
    redirect: '/d3/index',
    children: [
      { path: 'index', component: () => import('@/views/d3/index.vue') },
      {
        path: 'relationship-diagram',
        meta: { title: 'Relationship Diagram' },
        component: () => import('@/views/d3/relationship-diagram/index.vue'),
      },
      {
        path: 'scatter-diagram',
        meta: { title: 'Scatter Diagram' },
        component: () => import('@/views/d3/scatter-diagram/index.vue'),
      },
      {
        path: 'scatter-diagram-plus',
        meta: { title: 'Scatter Diagram Plus' },
        component: () => import('@/views/d3/scatter-diagram/plus.vue'),
      },
      {
        path: 'heatmap-diagram',
        meta: { title: 'Heatmap Diagram' },
        component: () => import('@/views/d3/heatmap-diagram/d3-version.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router

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
    meta: { isMenu: true, title: 'Echarts demos' },
    children: [
      { path: 'index', component: () => import('@/views/echarts/index.vue') },
      {
        path: 'line-bar-diagram',
        meta: { title: 'Line-Bar Diagram' },
        component: () => import('@/views/echarts/line-bar-diagram.vue'),
      },
      {
        path: 'bar-diagram',
        meta: { title: 'Bar Diagram' },
        component: () => import('@/views/echarts/bar-diagram/index.vue'),
      },
      {
        path: 'pie-diagram',
        meta: { title: 'Pie Diagram' },
        component: () => import('@/views/echarts/pie-diagram/index.vue'),
      },
      {
        path: 'heatmap-diagram-rect',
        meta: { title: 'Heatmap Diagram(rect)' },
        component: () => import('@/views/d3/heatmap-diagram-rect/echarts-version.vue'),
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
    meta: { isMenu: true, title: 'D3 demos' },
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
        path: 'heatmap-diagram-circle',
        meta: { title: 'Heatmap Diagram(circle)' },
        component: () => import('@/views/d3/heatmap-diagram-circle/index.vue'),
      },
      {
        path: 'heatmap-diagram-circle-plus',
        meta: { title: 'Heatmap Diagram(circle) Plus' },
        component: () => import('@/views/d3/heatmap-diagram-circle/plus.vue'),
      },
      {
        path: 'heatmap-diagram-rect',
        meta: { title: 'Heatmap Diagram(rect)' },
        component: () => import('@/views/d3/heatmap-diagram-rect/d3-version.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router

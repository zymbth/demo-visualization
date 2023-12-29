import Layout from '@/layout/index.vue'

const d3Router = {
  path: '/d3',
  component: Layout,
  // redirect: '/d3/index',
  meta: { isMenu: true, title: 'D3 demos' },
  children: [
    { path: '', component: () => import('@/views/d3/index.vue') },
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
    {
      path: 'venn-diagram',
      meta: { titel: 'Venn Diagram' },
      component: () => import('@/views/d3/venn-diagram/index.vue'),
    },
  ],
}

export default d3Router

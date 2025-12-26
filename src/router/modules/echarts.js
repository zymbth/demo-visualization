import Layout from '@/layout/index.vue'

const echartsRouter = {
  path: '/echarts',
  component: Layout,
  // redirect: '/echarts/index',
  meta: { isMenu: true, title: 'Echarts demo' },
  children: [
    { path: '', component: () => import('@/views/echarts/index.vue') },
    {
      path: 'bar-diagram',
      meta: { title: 'Bar Diagram' },
      component: () => import('@/views/echarts/bar-diagram.vue'),
    },
    {
      path: 'line-bar-diagram',
      meta: { title: 'Line-Bar Diagram' },
      component: () => import('@/views/echarts/line-bar-diagram/index.vue'),
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
      path: 'heatmap-diagram-circle',
      meta: { title: 'Heatmap Diagram(circle)' },
      component: () => import('@/views/d3/heatmap-diagram-circle/echarts-version.vue'),
    },
    {
      path: 'multi-grid-scatter-diagram',
      meta: { title: 'Multi-Grid Scatter Diagram' },
      component: () => import('@/views/echarts/multi-grid-scatter-diagram/index.vue'),
    },
    {
      path: 'synchronize-grids-zoom',
      meta: { title: 'Synchronize Grids(Zoom)' },
      component: () => import('@/views/echarts/synchronize-grids-zoom/index.vue'),
    },
    {
      path: 'treemap-diagram',
      meta: { title: 'Treemap Diagram' },
      component: () => import('@/views/echarts/treemap-diagram/index.vue'),
    },
  ],
}

export default echartsRouter

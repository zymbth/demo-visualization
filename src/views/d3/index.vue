<script setup>
import RoutePageUl from '@/components/route-page-ul.vue'
import ReferenceUl from '@/components/reference-ul.vue'

const references = [
  { label: "D3's repository", link: 'https://github.com/d3/d3' },
  { label: "D3's docs", link: 'https://d3js.org/' },
  { label: 'Tutorials & Examples', link: 'https://observablehq.com/@d3/gallery' },
  {
    label: 'venn.js',
    link: 'https://github.com/benfred/venn.js',
    intro:
      '一个基于 d3.js 的 js 库，可用于创建和操作 Venn 图。Venn 图是一种用圆形或椭圆形区域表示集合和它们之间的交集关系的图表。venn.js 库可以帮助开发人员轻松地创建 Venn 图，并且可以对图表进行交互操作和定制化。它可以用于展示数据集之间的重叠和关联关系，适用于数据分析、可视化和展示领域。该库提供了丰富的 API 和功能，使得用户可以根据自己的需求创建出美观、交互性强的 Venn 图表。',
  },
]
</script>
<template>
  <div>
    <h3>References:</h3>
    <ReferenceUl :references="references" />
    <h3>Demo list:</h3>
    <RoutePageUl
      :routes="$router.options.routes.find(r => r.path === '/d3')?.children"
      basePath="/d3" />
  </div>
</template>

<script setup>
import RoutePageUl from '@/components/route-page-ul.vue'
import ReferenceUl from '@/components/reference-ul.vue'

const references = [{ label: "Echarts' official website", link: 'https://echarts.apache.org' }]
</script>
<template>
  <div>
    <h3>References:</h3>
    <ReferenceUl :references="references" />
    <h3>Demo list:</h3>
    <RoutePageUl
      :routes="$router.options.routes.find(r => r.path === '/echarts')?.children"
      basePath="/echarts" />
    <h3>Tips:</h3>
    <ul class="no-marker">
      <li>
        通过免费CDN引入存在风险。完整引入省事但依赖包较大，可选择按需引入，或<a
          href="https://echarts.apache.org/builder.html"
          target="_blank"
          >在线定制</a
        >
      </li>
      <li>
        官网示例很方便，但仅展露全部功能的冰山一角，更多功能在配置项及API中。不够熟悉时，可借助AI大模型寻求解决方案或灵感
      </li>
      <li>本项目 echarts demo 都添加了 window.resize 事件监听，可自适应屏幕尺寸</li>
      <li>
        本项目 echarts demo 根据静态数据生成，实际项目中可能需动态获取，且需要根据数据更新图表
      </li>
    </ul>
  </div>
</template>

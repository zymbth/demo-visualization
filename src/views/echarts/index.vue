<script setup>
import { resolveRoutePath } from '@/utils/common-methods'

const references = [{ label: "Echarts' official website", link: 'https://echarts.apache.org' }]
</script>
<template>
  <div>
    <h3>References:</h3>
    <div class="reference-list">
      <div class="reference" v-for="r in references" :key="r.label">
        <label>{{ r.label }}</label>
        <a :href="r.link" target="_blank">Go</a>
      </div>
    </div>
    <h3>Demos:</h3>
    <ul class="no-marker">
      <li
        v-for="p in $router.options.routes
          .find(r => r.path === '/echarts')
          ?.children.filter(r => r.path !== 'index') ?? []"
        :key="p.path">
        <router-link :data-test="p.path" :to="resolveRoutePath('/echarts', p.path)">{{
          p.meta?.title || p.path
        }}</router-link>
      </li>
    </ul>
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
    </ul>
  </div>
</template>
<style lang="scss" scoped>
.reference-list {
  position: relative;
  background-color: #fcfcfc;
  padding: 8px 12px;
  border-radius: 3px;
  overflow: hidden;
  filter: grayscale(0.1);
  &::before {
    content: ' ';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 2px;
    background-color: #d8dad9;
  }
}
.reference {
  margin: 0.4em 0;
  a {
    margin-left: 4px;
    text-decoration: underline;
  }
}
</style>

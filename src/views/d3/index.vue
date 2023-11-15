<script setup>
import { resolveRoutePath } from '@/utils/common-methods'

const references = [
  { label: "D3's repository", link: 'https://github.com/d3/d3' },
  { label: "D3's docs", link: 'https://d3js.org/' },
  { label: 'Tutorials & Examples', link: 'https://observablehq.com/@d3/gallery' },
]
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
          .find(r => r.path === '/d3')
          ?.children.filter(r => r.path !== 'index') ?? []"
        :key="p.path">
        <router-link :to="resolveRoutePath('/d3', p.path)">{{
          p.meta?.title || p.path
        }}</router-link>
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

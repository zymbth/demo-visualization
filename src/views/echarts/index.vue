<script setup>
import { resolveRoutePath } from '@/utils/common-methods'
</script>
<template>
  <ul class="no-marker">
    <li
      v-for="p in $router.options.routes
        .find(r => r.path === '/echarts')
        ?.children.filter(r => r.path !== 'index') ?? []"
      :key="p.path">
      <router-link :data-test="p.path" :to="resolveRoutePath('/echarts', p.path)">{{ p.meta?.title || p.path }}</router-link>
    </li>
  </ul>
</template>

<script setup>
/**
 * 组件 - 到指定路由列表的页面导航
 */
const props = defineProps({
  routes: { type: Array, default: () => [] },
  basePath: { type: String, default: '/' },
})

function resolveRoutePath(...paths) {
  let resolvedPath = ''

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i]

    if (typeof path !== 'string') {
      throw new TypeError('All arguments must be strings')
    }

    if (resolvedPath === '') {
      resolvedPath = path
    } else if (path.startsWith('/')) {
      resolvedPath = path
    } else {
      resolvedPath = `${resolvedPath}/${path}`
    }
  }

  return resolvedPath
}
</script>
<template>
  <ul class="no-marker">
    <li v-for="p in routes.filter(r => r.path)" :key="p.path">
      <router-link :to="resolveRoutePath(basePath, p.path)">{{
        p.meta?.title || p.path
      }}</router-link>
    </li>
  </ul>
</template>

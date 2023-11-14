<script setup>
import { routes } from '@/router'

function resolvePath(...paths) {
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
  <div class="sidebar-wrapper">
    <div class="menu-lv1" v-for="route in routes.filter(r => r.meta?.isMenu)" :key="route.path">
      <label>{{ route.meta?.title }}</label>
      <ul v-if="route.children.length > 0">
        <li
          class="menu-lv2"
          v-for="subRoute in route.children.filter(r => r.path !== 'index')"
          :key="subRoute.path">
          <router-link :to="resolvePath(route.path, subRoute.path)">{{
            subRoute.meta?.title || subRoute.path
          }}</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.sidebar-wrapper {
  width: 200px;
  max-height: 80vh;
  border-radius: 4px;
  padding: 10px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  text-align: left;

}
ul {
  padding-inline-start: 0;
  list-style-type: none;
}
</style>
<script setup>
import { routes } from '@/router'
import { resolveRoutePath } from '@/utils/common-methods'

</script>
<template>
  <div class="sidebar-wrapper">
    <div v-for="route in routes.filter(r => r.meta?.isMenu)" :key="route.path">
      <label>{{ route.meta?.title }}</label>
      <ul class="no-marker" v-if="route.children.length > 0">
        <li
          v-for="subRoute in route.children.filter(r => r.path !== 'index')"
          :key="subRoute.path">
          <router-link :to="resolveRoutePath(route.path, subRoute.path)">{{
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
  max-height: calc(100vh - 2 * var(--nav-height) - 40px); //80vh;
  border-radius: 4px;
  padding: 10px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  text-align: left;
  overflow-y: auto;
  label {
    font-weight: bold;
    font-size: 16px;
  }
  ul {
    margin-block-start: 0.5em;
    margin-block-end: 0.5em;
  }
}
</style>

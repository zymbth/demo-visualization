<script setup>
import { ref } from 'vue'
import { routes } from '@/router'
import RoutePageUl from '@/components/route-page-ul.vue'

const collapsed = ref(true)
</script>
<template>
  <div class="sidebar-wrapper" :class="{ collapsed }">
    <!-- 展开 - 列表 -->
    <div class="sidebar-cont" v-if="!collapsed">
      <div v-for="route in routes.filter(r => r.meta?.isMenu)" :key="route.path">
        <label>{{ route.meta?.title }}</label>
        <RoutePageUl :routes="route.children" :basePath="route.path" />
      </div>
      <div class="sidebar-close-icon" @click="collapsed = true">+</div>
    </div>
    <!-- 收缩 - 图标 -->
    <div class="sidebar-icon" v-else @click="collapsed = false">
      <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
        <path
          d="M913.6 135.2H380.2c-26.7 0-44.4 17.8-44.4 44.4V224c0 26.7 17.8 44.4 44.4 44.4h533.3c26.7 0 44.4-17.8 44.4-44.4v-44.4c.1-26.6-17.7-44.4-44.3-44.4zm-755.6 0h-44.4c-22.2 0-44.4 22.2-44.4 44.4V224c0 22.2 22.2 44.4 44.4 44.4H158c22.2 0 44.4-22.2 44.4-44.4v-44.4c.1-22.2-22.1-44.4-44.4-44.4zm0 311.1h-44.4c-22.2 0-44.4 22.2-44.4 44.4v44.4c0 22.2 22.2 44.4 44.4 44.4H158c22.2 0 44.4-22.2 44.4-44.4v-44.4c.1-22.2-22.1-44.4-44.4-44.4zm755.6 0H380.2c-26.7 0-44.4 17.8-44.4 44.4v44.4c0 26.7 17.8 44.4 44.4 44.4h533.3c26.7 0 44.4-17.8 44.4-44.4v-44.4c.1-26.6-17.7-44.4-44.3-44.4zM158 757.4h-44.4c-22.2 0-44.4 22.2-44.4 44.4v44.4c0 22.2 22.2 44.4 44.4 44.4H158c22.2 0 44.4-22.2 44.4-44.4v-44.4c.1-22.2-22.1-44.4-44.4-44.4zm755.6 0H380.2c-26.7 0-44.4 17.8-44.4 44.4v44.4c0 26.7 17.8 44.4 44.4 44.4h533.3c26.7 0 44.4-17.8 44.4-44.4v-44.4c.1-26.6-17.7-44.4-44.3-44.4z"
          fill="#fff"
          style="--darkreader-inline-fill: #212425" />
      </svg>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.sidebar-wrapper {
  height: 400px;
  width: 200px;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  text-align: left;
  overflow-x: hidden;
  overflow-y: auto;
  white-space: nowrap;
  transition: all 0.36s ease-in-out;
  &.collapsed {
    bottom: 36px;
    height: 36px;
    width: 36px;
    border-radius: 50%;
    background-color: #35c4f0;
    overflow: hidden;
  }
}
.sidebar-cont {
  position: relative;
  padding: 10px;
  .sidebar-close-icon {
    position: absolute;
    top: 0px;
    right: 10px;
    font-size: 26px;
    transform: rotate(45deg);
    cursor: pointer;
  }
  label {
    font-weight: bold;
    font-size: 16px;
  }
  ul {
    margin-block-start: 0.5em;
    margin-block-end: 0.5em;
  }
}
.sidebar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #fff;
  cursor: pointer;
}
</style>

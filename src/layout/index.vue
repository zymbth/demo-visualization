<script setup>
import SidebarComp from './sidebar/index.vue'
</script>
<template>
  <nav class="stickynav">
    <div class="nav-links">
      <router-link to="/">Home</router-link>
      <router-link to="/echarts">Echarts</router-link>
      <router-link to="/d3">D3</router-link>
    </div>
  </nav>
  <section class="main-sec">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :max="30">
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </transition>
    </router-view>
  </section>
  <SidebarComp class="sidebar" />
</template>
<style lang="scss" scoped>
.nav-links {
  display: flex;
  justify-content: center;
  align-items: center;
  column-gap: 12px;

  > a {
    display: block;
    height: var(--nav-height);
    line-height: var(--nav-height);
    position: relative;
  }
  > .router-link-active::after {
    content: ' ';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 2px;
    background-color: #646cff;
  }
}
.sidebar {
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  z-index: 999;
}
</style>
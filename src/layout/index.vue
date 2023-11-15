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
    <a
      class="github-link"
      href="https://github.com/zymbth/demo-visualization"
      target="_blank"
      title="repository">
      <img src="@/assets/github.svg" />
    </a>
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
.stickynav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  margin: 0 1em;
  color: #fff;
  background-color: #f1f1f1;
  border-radius: 0 0 12px 12px;
  z-index: 1000;
  .github-link {
    position: absolute;
    top: 50%;
    right: 12px;
    transform: translateY(-50%);
    > img {
      height: 36px;
      vertical-align: top;
    }
  }
}
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
  bottom: 50%;
  right: 12px;
  transform: translateY(50%);
  z-index: 3100;
}
</style>

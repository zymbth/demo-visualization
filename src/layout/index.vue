<template>
  <nav class="stickynav">
    <router-link to="/">Home</router-link>
    <router-link to="/echarts">Echarts</router-link>
    <router-link to="/d3">D3</router-link>
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
</template>

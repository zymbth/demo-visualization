<script setup></script>
<template>
  <ul>
    <li
      v-for="p in $router.options.routes
        .find(r => r.path === '/d3')
        ?.children.filter(r => r.path !== 'index') ?? []"
      :key="p.path">
      <router-link :to="p.path">{{ p.meta?.title || p.path }}</router-link>
    </li>
  </ul>
</template>

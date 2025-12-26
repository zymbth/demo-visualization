<script setup>
/**
 * 组件 - 参考链接列表
 */
const props = defineProps({
  references: { type: Array, default: () => [] },
})
</script>
<template>
  <div class="reference-list">
    <div class="reference" v-for="r in references" :key="r.label">
      <template v-if="!r.intro">
        <label>{{ r.label }}</label>
        <a v-if="r.link" :href="r.link" target="_blank"
          ><img class="svg-link" src="@/assets/link.svg"
        /></a>
      </template>
      <details v-else>
        <summary>
          <label>{{ r.label }}</label>
          <a v-if="r.link" :href="r.link" target="_blank"
            ><img class="svg-link" src="@/assets/link.svg"
          /></a>
        </summary>
        <p class="ref-intro">{{ r.intro }}</p>
      </details>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.reference-list {
  position: relative;
  background-color: var(--bg-color-1);
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
  .ref-intro {
    margin: 0.3em 0 0.3em 1em;
    color: #999;
  }
}
</style>

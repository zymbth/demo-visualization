<script setup>
/**
 * 菜单框
 * 菜单内容放在插槽中
 * @prop {boolean} modelValue 显/隐
 */
const props = defineProps({
  modelValue: { default: {} },
})
const emit = defineEmits(['update:modelValue'])

const showMenu = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const contextmenu = ref()

function positionMenu(event) {
  contextmenu.value.style.top = event.layerY - 5 + 'px'
  contextmenu.value.style.left = event.layerX - 5 + 'px'
  if (window.innerWidth - 200 < event.clientX) {
    contextmenu.value.style.left = 'unset'
    contextmenu.value.style.right = 0
  }
}
defineExpose({ positionMenu })
</script>
<template>
  <!-- 菜单框 -->
  <div v-show="showMenu" id="contextmenu" ref="contextmenu" @mouseleave="showMenu = false">
    <span class="hideContextMenu" @click="showMenu = false">+</span>
    <slot></slot>
  </div>
</template>
<style lang="scss" scoped>
#contextmenu {
  position: absolute;
  top: 0;
  left: 0;
  height: auto;
  width: 160px;
  padding: 10px 0;
  border-radius: 3px;
  border: 1px solid #999999;
  background-color: #f4f4f4;
  box-shadow: 1px 1px 3px 1px rgba(0, 0, 0, 0.2);
  transition: display 0.3s ease;
  z-index: 3000;
  &:deep .menu-item {
    font-size: 14px;
    padding: 4px 10px;
    cursor: pointer;
    &:hover {
      background-color: #dedede;
    }
  }
}
.hideContextMenu {
  position: absolute;
  top: 0;
  right: 5px;
  font-size: 24px;
  transform: rotate(45deg);
  cursor: pointer;
}
</style>

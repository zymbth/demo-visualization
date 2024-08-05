import { debounce } from '@/utils/common-methods'

/**
 * 页面窗口resize监听，包括window.resize以及侧边栏显示/隐藏切换
 * @param {Function} cb resize handler 函数
 * @returns
 * @example
 * 仅在vue3 setup中使用
 * import useListenPageResize from '@/use/useListenPageResize'
 *
 * const resizeHandler = () => console.log('do something')
 * useListenPageResize(resizeHandler)
 */
export default function (cb) {
  if (!cb) return

  const resizeDebounceHandler = debounce(cb)

  onMounted(() => {
    window.addEventListener('resize', resizeDebounceHandler)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeDebounceHandler) // 监听事件解绑
  })
}

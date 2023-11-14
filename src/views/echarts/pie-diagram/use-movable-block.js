/**
 * 创建可拖拽移动框
 * @param {string|Element} targetEl target element
 * @param {string|Element} parentEl parent element
 * @returns
 * @example
 * import useMovableBlock from '@/use/use-movable-block'
 * const { targetEl } = useMovableBlock('.target-el-class', '.parent-el-class')
 */
export default function (targetEl, parentEl) {
  // 可拖拽框元素
  let el
  // 定位信息
  let posiObj = { enablemove: false, x: undefined, y: undefined }
  // 拖拽事件监听中
  let onlistenning = false

  // 初始化方法，未做错误提示
  function init() {
    if (!targetEl) return
    if (typeof targetEl === 'string') targetEl = document.querySelector(targetEl)
    if (!targetEl) {
      if (!parentEl) return
      if (typeof parentEl === 'string') parentEl = document.querySelector(parentEl)
      targetEl = document.createElement('div')
      parentEl.append(targetEl)
    }
    el = targetEl
    addListeners()
  }

  function handleStartGrab() {
    // console.log('handleStartGrab')
    posiObj.enablemove = true
    el.style.cursor = 'grabbing'
  }

  function handleEndGrab() {
    // console.log('handleEndGrab')
    posiObj = { enablemove: false, x: undefined, y: undefined }
    el.style.cursor = 'grab'
  }

  function handleGrabbing(event) {
    // console.log('handleGrabbing')
    if (!posiObj.enablemove) return
    let tx, ty // 待移动距离
    const { x, y } = event // 当前鼠标位置
    // 计算鼠标距上一次移动的距离
    if (posiObj.x) tx = x - posiObj.x
    if (posiObj.y) ty = y - posiObj.y
    // 更新鼠标位置
    posiObj.x = x
    posiObj.y = y
    if ((tx || tx === 0) && (ty || ty === 0)) {
      const tmp = getComputedStyle(el)
      const prevLeft = tmp.getPropertyValue('left')
      const prevTop = tmp.getPropertyValue('top')
      // 移动
      el.style.left = `calc(${prevLeft} + ${tx}px)`
      el.style.top = `calc(${prevTop} + ${ty}px)`
    }
  }

  function addListeners() {
    if (onlistenning || !el) return
    onlistenning = true
    // 点击开启拖动
    el.addEventListener('mousedown', handleStartGrab)
    // 松开/退出拖动
    el.addEventListener('mouseup', handleEndGrab)
    el.addEventListener('mouseleave', handleEndGrab)
    // 拖动，节流处理
    el.addEventListener('mousemove', handleGrabbing)
  }
  function removeListeners() {
    if (!onlistenning || !el) return
    onlistenning = false
    el.removeEventListener('mousedown', handleStartGrab)
    el.removeEventListener('mouseup', handleEndGrab)
    el.removeEventListener('mouseleave', handleEndGrab)
    el.removeEventListener('mousemove', handleGrabbing)
    el.style.cursor = 'default'
  }

  init()

  return {
    targetEl: el,
    addListeners,
    removeListeners,
  }
}

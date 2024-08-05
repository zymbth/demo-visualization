<script setup>
import { myIsNumber } from '@/utils/common-methods'
import useMovableBlock from '@/use/useMovableBlock'

const props = defineProps({
  data: { type: Array, required: true },
  height: { type: [Number, String], default: 200 },
  width: { type: [Number, String], default: 300 },
  rect: { type: [Number, String], default: 20 },
})

const emit = defineEmits(['select'])

const trumbRef = ref()
const containerRef = ref()

const validProps = {
  height: props.height && !isNaN(parseInt(props.height)) ? parseInt(props.height) : 200,
  width: props.width && !isNaN(parseInt(props.width)) ? parseInt(props.width) : 300,
  rect: props.rect && !isNaN(parseInt(props.rect)) ? parseInt(props.rect) : 20,
}

// 容器尺寸
const constants = {
  height: validProps.height + 'px',
  width: validProps.width + 'px',
}

let resetGrabPosi

onMounted(() => {
  watch(() => props.data, generateD3, { immediate: true })
  ;({ resetGrabPosi } = useMovableBlock(trumbRef.value, containerRef.value, 'horizontal'))
})
onBeforeUnmount(() => {
  clearSVG()
})

/* svg热力图 */

// 散点行列数
const rows = computed(() => props.data.length)
const cols = computed(() => props.data[0]?.compounds?.length ?? 0)
// 散点尺寸
const cellRect = { width: 10, height: 7 }
// 散点颜色
const legendColor = ['#2d85c5', '#e2e2e2', '#c33726']
const legendPoint = [-1, 0, 1]
function getColorByVal(val) {
  return d3.scaleLinear().domain(legendPoint).range(legendColor).clamp(true)(val)
}
// 绘制
function generateD3() {
  if (!(props.data instanceof Array) || props.data.length === 0) console.error('Invalid date')
  clearSVG()
  // svg
  const svg = d3.select(trumbRef.value).append('svg')
  svg
    .attr('width', cellRect.width * cols.value)
    .attr('height', cellRect.height * rows.value)
    .attr('overflow', 'visible')
  // chart
  const g = svg.append('g')
  // 画方块
  g.selectAll('rect')
    .data(getRectData())
    .enter()
    .append('rect')
    .attr('x', (d, i) => d.x)
    .attr('y', (d, i) => d.y)
    .attr('width', cellRect.width)
    .attr('height', cellRect.height)
    .attr('fill', (d, i) => d.color)
}
// 清除
function clearSVG() {
  trumbRef.value.querySelector('svg')?.remove()
}

/**
 * 方块数据，过滤无效数值
 * @returns {Array} [{ x: 0, y: 0, color: '#fff' }, ...], x,y值为定位的像素值，color为方块颜色
 */
function getRectData() {
  return props.data.reduce((prev, curr, colIdx) => {
    return curr.compounds.reduce((prev1, curr1, rowIdx) => {
      if (myIsNumber(curr1.value))
        prev1.push({
          x: colIdx * cellRect.width,
          y: rowIdx * cellRect.height,
          color: getColorByVal(curr1.value),
        })
      return prev1
    }, prev)
  }, [])
}

/* 缩放控制 */

const maxScale = computed(() => validProps.height / (rows.value * cellRect.height) - 0.1)
const minScale = computed(() => Math.max(0.125, validProps.width / (cols.value * cellRect.width)))
const scale = ref(scaleRestrict((0.5 * validProps.height) / (cellRect.height * rows.value)))
const trumbTransform = computed(() => `scale(${scale.value})`)
const trumbSize = computed(() => {
  return {
    width: cellRect.width * cols.value * scale.value + 'px',
    height: cellRect.height * rows.value * scale.value + 'px',
  }
})
async function handleZoom(e) {
  const { deltaY } = e
  let currScale = scale.value + scale.value * (deltaY > 0 ? -0.1 : 0.1)
  currScale = scaleRestrict(currScale)
  if (scale.value === currScale) return
  scale.value = currScale
  // await nextTick()
  // adjustRectPosi()
}
// Restrict scale
function scaleRestrict(val) {
  return Math.max(Math.min(maxScale.value, val), minScale.value)
}

/* 选择区域 */

const rectSelectRef = ref() // 选择区域
const rectOriginLeft = ref(0) // 选择区域初始left（未计算缩放）
const rectOriginWidth = cellRect.width * validProps.rect // 选择区域初始宽度（未计算缩放）
const rectLeft = computed(() => rectOriginLeft.value * scale.value + 'px') // 选择区域left（计算缩放后）
const rectWidth = computed(() => rectOriginWidth * scale.value + 'px') // 选择区域宽度（计算缩放后）
let emitTimer = null
// 点击更新区域位置
function updRect(e) {
  if (e.target === rectSelectRef.value) return
  // 根据鼠标点的offsetX，减去宽度的一半，得到left
  let currLeft = e.offsetX - rectOriginWidth / 2
  // left不能超出trumb的范围
  if (currLeft < 0) currLeft = 0
  else if (currLeft > trumbSize.value.width - rectOriginWidth)
    currLeft = trumbSize.value.width - rectOriginWidth
  rectOriginLeft.value = currLeft
  // 触发父组件图标的datazoom事件（横向缩放条起始位置）
  if (emitTimer) clearTimeout(emitTimer)
  emitTimer = setTimeout(() => {
    emit('select', (rectOriginLeft.value / (cellRect.width * cols.value)) * 100)
    emitTimer = null
  }, 300)
}
// 手动设置区域的起始百分比（父组件调用）
async function setRectStart(start) {
  if (emitTimer) return // 避免无限重复触发
  if (!myIsNumber(start)) return
  // 根据父组件图表横向缩放条的起始位置，计算出left
  rectOriginLeft.value = (start / 100) * (cellRect.width * cols.value)
  await nextTick()
  adjustRectPosi()
}
// 位置调整，使得选择区域在trumb中间
function adjustRectPosi() {
  const rectCenterToLeft =
    trumbRef.value.offsetLeft + rectSelectRef.value.offsetLeft + (rectOriginWidth * scale.value) / 2
  const tmp = rectCenterToLeft - validProps.width / 2
  const currLeft = parseFloat(getComputedStyle(trumbRef.value).left)
  trumbRef.value.style.left = currLeft - tmp + 'px'
  resetGrabPosi?.()
}

defineExpose({ setRectStart })
</script>
<template>
  <div class="trumb-container" ref="containerRef">
    <div class="trumb" ref="trumbRef" @wheel.stop.prevent="handleZoom" @click="updRect">
      <div class="rect-select" ref="rectSelectRef"></div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.trumb-container {
  position: relative;
  height: v-bind('constants.height');
  width: v-bind('constants.width');
  background-color: #00000033;
  overflow: hidden;
}
.trumb {
  position: absolute;
  left: 12px;
  top: 50%;
  width: v-bind('trumbSize.width');
  height: v-bind('trumbSize.height');
  overflow: visible;
  transform: translateY(-50%);
  user-select: none;
}
:deep(.trumb svg) {
  transform: v-bind(trumbTransform);
  transform-origin: top left;
  vertical-align: top;
}
.rect-select {
  position: absolute;
  top: 0;
  left: v-bind(rectLeft);
  height: 100%;
  width: v-bind(rectWidth);
  box-shadow: 0 0 4px 2px #00000033;
  z-index: 1;
}
</style>

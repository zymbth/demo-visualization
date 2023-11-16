<script setup>
import { myIsNumber } from '@/utils/common-methods'
import exportSvgToPng from '@/utils/export-svg-to-png'
import ContextMenuComp from '@/components/ContextMenu/index.vue'
import data from './data.json'

const heatmap = ref(data)

// 图例极值
const legendRange = { min: -1, max: 1, left: 100 }

const svgChartRef = ref()

onMounted(() => {
  generateD3()
})

onBeforeUnmount(() => {
  svgChartRef.value.querySelector('svg')?.remove()
})

// 散点尺寸
const cellRect = { width: 20, height: 14 }
// 图表边距
const charPd = { top: 60, right: 20, bottom: 170, left: 200 }

function generateD3() {
  if (!(heatmap.value instanceof Array) || heatmap.value.length === 0) console.error('Invalid date')
  // 散点行列数
  const rows = heatmap.value.length
  const cols = heatmap.value[0]?.compounds?.length ?? 0
  // svg 表格宽高
  const svgChartWidth = cellRect.width * cols + charPd.left + charPd.right
  const svgChartHeight = cellRect.height * rows + charPd.top + charPd.bottom
  // svg
  const svg = d3.select(svgChartRef.value).append('svg')
  svg
    .attr('width', Math.max(560, svgChartWidth)) // 最小宽度 560px
    .attr('height', svgChartHeight)
    .attr('overflow', 'visible')
  // chart
  const g = svg.append('g').attr('transform', `translate(${charPd.left}, ${charPd.top})`)
  // 1. 图例
  // 预先定义linearGradient
  const defs = svg.append('defs')
  defs
    .append('linearGradient')
    .attr('id', 'htt-linear-gradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '100%')
    .attr('y2', '0%')
    .selectAll('stop')
    .data([
      { offset: '0%', color: legendColor[0] },
      { offset: '50%', color: legendColor[1] },
      { offset: '100%', color: legendColor[2] },
    ])
    .enter()
    .append('stop')
    .attr('offset', d => d.offset)
    .attr('stop-color', d => d.color)
    .attr('stop-opacity', 1)
  const legend = svg.append('g').attr('font-size', 12)
  legend
    .append('text')
    .attr('x', 10)
    .attr('y', 30)
    .text('Delta psi:')
    .attr('font-size', 20)
    .attr('font-weight', 'bold')
  legend
    .append('rect')
    .attr('x', legendRange.left)
    .attr('y', 16)
    .attr('width', 130)
    .attr('height', 16)
    .attr('fill', 'url(#htt-linear-gradient)')
  legend.append('text').attr('x', legendRange.left).attr('y', 46).text(legendRange.min)
  legend
    .append('text')
    .attr('x', legendRange.left + 120)
    .attr('y', 46)
    .text(legendRange.max)
  // 2. 画网格线
  const drawLine = d3
    .line()
    .x(d => d.x)
    .y(d => d.y)
  const gridLines = [
    ...Array.from({ length: rows }).map((_, idx) => ({
      sX: 0,
      sY: cellRect.height * idx,
      eX: cellRect.width * cols,
      eY: cellRect.height * idx,
    })),
    ...Array.from({ length: cols }).map((_, idx) => ({
      sX: cellRect.width * (idx + 1),
      sY: 0,
      eX: cellRect.width * (idx + 1),
      eY: cellRect.height * rows,
    })),
  ]
  g.selectAll('path')
    .data(gridLines)
    .enter()
    .append('path')
    .attr('class', 'grid-line')
    .attr('d', d =>
      drawLine([
        { x: d.sX, y: d.sY },
        { x: d.eX, y: d.eY },
      ])
    )
    .attr('stroke', '#ddd')
    .attr('stroke-width', 0.5)
  // 3. 画方块
  g.selectAll('rect')
    .data(getRectData())
    .enter()
    .append('rect')
    .attr('x', (d, i) => d.x)
    .attr('y', (d, i) => d.y)
    .attr('width', cellRect.width)
    .attr('height', cellRect.height)
    .attr('fill', (d, i) => d.color)
  // 4. 画坐标轴
  const xScale = d3
    .scaleLinear()
    .domain([0, cols])
    .range([0, cellRect.width * cols])
  const yScale = d3
    .scaleLinear()
    .domain([0, rows])
    .range([0, cellRect.height * rows])
  const xAxis = d3
    .axisBottom(xScale)
    .tickValues(d3.range(0, cols))
    .tickFormat(getCompoundName)
    .tickSizeOuter(0)
  const yAxis = d3
    .axisLeft(yScale)
    .tickValues(d3.range(0, rows))
    .tickFormat(getRegionName)
    .tickSizeOuter(0)
  const xAxisGroup = g
    .append('g')
    .attr('color', '#333')
    .attr('transform', `translate(0, ${cellRect.height * rows})`)
  xAxisGroup
    .call(xAxis)
    .selectAll('text')
    .attr('width', 20)
    .attr('visibility', 'visible')
    .attr('text-anchor', 'end') // .attr('transform-origin', 'right top')
    .attr('transform', 'translate(5,0) rotate(-45)')
  const yAxisGroup = g.append('g').attr('color', '#333')
  yAxisGroup.call(yAxis).selectAll('text').attr('transform', 'translate(0,7)')
}
/**
 * 方块数据，过滤无效数值
 * @returns {Array} [{ x: 0, y: 0, color: '#fff' }, ...], x,y值为定位的像素值，color为方块颜色
 */
function getRectData() {
  return heatmap.value.reduce((prev, curr, rowIdx) => {
    return curr.compounds.reduce((prev1, curr1, colIdx) => {
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
// 根据横轴compound的索引获取compound的名称
function getCompoundName(x) {
  return heatmap.value[0]?.compounds[x]?.compound ?? ''
}
// 根据纵轴gene的索引获取gene的名称
function getRegionName(y) {
  const { region = '', type = '', location = '' } = heatmap.value[y] || {}
  return `(${type})${region}(${location})`
}

const legendColor = ['#2d85c5', '#e2e2e2', '#c33726']
const legendPoint = [-1, 0, 1]
function getColorByVal(val) {
  return d3.scaleLinear().domain(legendPoint).range(legendColor).clamp(true)(val)
}

// 右键菜单：导出 svg 为图片
const handleDownload = (imageType = 'image/jpeg') => {
  exportSvgToPng(svgChartRef.value.querySelector('svg'), '', { imageType })
}
const showMenu = ref(false),
  contextMenuRef = ref()
const handleContextMenu = event => {
  contextMenuRef.value.positionMenu(event)
  showMenu.value = true
}
</script>
<template>
  <div>
    <div class="svg-container" ref="svgChartRef" @contextmenu.prevent="handleContextMenu">
      <!-- 右键菜单框 -->
      <ContextMenuComp v-model="showMenu" ref="contextMenuRef">
        <div class="menu-item" @click="handleDownload('image/jpeg')">Download jpeg</div>
        <div class="menu-item" @click="handleDownload('image/png')">Download png</div>
      </ContextMenuComp>
    </div>
    <h3>Notes:</h3>
    <ul class="no-marker">
      <li>添加二维坐标系，绘制热力图及图例</li>
      <li>添加右键菜单，可保存为图片</li>
    </ul>
  </div>
</template>
<style lang="scss" scoped>
.svg-container {
  position: relative;
  min-height: 280px;
  overflow: auto;
  &:deep svg {
    overflow: visible;
  }
  &:deep .grid-line {
    fill: none;
    shape-rendering: crispEdges;
    vector-effect: non-scaling-stroke;
  }
}
</style>

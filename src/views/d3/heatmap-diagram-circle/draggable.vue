<script setup>
import { myIsNumber } from '@/utils/common-methods'
import data from './data.json'

const heatmap = ref(data)

const chartRef = ref()

onMounted(() => {
  generateD3()
})

const circleRadius = 8

// [0, 4] => [1, circleRadius]
const calcLog2fcRadio = val => {
  // 非数字返回透明色
  if (!myIsNumber(val)) return 0
  return d3.scaleLinear().domain([0, 4]).range([3, circleRadius]).clamp(true)(Math.abs(val))
}
// 根据log2fc绝对值大小获取对应的半径 [0, 4] => [1, circleRadius]
const getRadioByABSLog2fc = (x, y) => {
  const val = heatmap.value[y].compounds[x].value?.log2_fc
  return calcLog2fcRadio(val)
}

const getLog2FCValue = (x, y) => {
  return heatmap.value[y].compounds[x].value?.log2_fc
}
// 根据值区间[-4,4]从颜色区间['#663d71', '#ddd3e1']中获取对应的颜色
const log2FCColorRange = ['#c33726', '#e2e2e2', '#2d85c5'] // ['#663d71', '#ddd3e1']
const getColorByLog2FC = (x, y) => {
  const val = heatmap.value[y].compounds[x].value?.log2_fc
  // 非数字返回透明色
  if (!myIsNumber(val)) return 'transparent'
  if (val == 0) return log2FCColorRange[1]
  if (val > 0) return log2FCColorRange[0]
  return log2FCColorRange[2]
}

// 散点尺寸
const cellRect = { width: 20, height: 20 }
// 图表边距
const charPd = { top: 70, right: 20, bottom: 170, left: 110 }

let geneList = [],
  compoundList = []

let chartGroup, xAxisGroup, gridWrap, rows, cols, showCols

/**
 * 使用 d3.js 创建 heatmap.value 对应的一个直角坐标系，x轴为compound，y轴为gene，
 * 每个单元格内放置圆形，使用log10_qvalue作为圆形的半径大小
 */
function generateD3() {
  if (!(heatmap.value instanceof Array) || heatmap.value.length === 0) {
    console.error('heatmap date is empty')
  }
  geneList = heatmap.value.map(p => p.gene) || []
  compoundList = heatmap.value[0]?.compounds?.map(p => p.compound) || []

  const svg = d3.select(chartRef.value).append('svg')
  // 散点行列数
  rows = geneList.length
  cols = compoundList.length
  showCols = Math.min(cols, 30)
  // svg 表格宽高
  const svgChartWidth = cellRect.width * showCols + charPd.left + charPd.right
  const svgChartHeight = cellRect.height * rows + charPd.top + charPd.bottom
  // svg
  svg.selectAll('*').remove()
  svg
    .attr('width', Math.max(560, svgChartWidth)) // 最小宽度 560px
    .attr('height', svgChartHeight)
    .attr('overflow', 'visible')

  // chart
  chartGroup = svg.append('g').attr('transform', `translate(${charPd.left}, ${charPd.top})`)
  // 坐标轴
  generateXAxisGroup()
  const yScale = d3
    .scaleLinear()
    .domain([0, rows])
    .range([cellRect.width * rows, 0])
  const yAxis = d3
    .axisLeft(yScale)
    .tickValues(d3.range(0, rows + 1))
    .tickFormat(y => geneList[y - 1] || '')
    .tickSizeOuter(0)
  const yAxisGroup = chartGroup.append('g')
  yAxisGroup.call(yAxis).selectAll('text').classed('gene-text', true)

  // 网格
  const clip = uid('heatmap-clipper')
  svg
    .append('clipPath')
    .attr('id', clip.id)
    .append('rect')
    .attr('x', cellRect.width * 0.5)
    .attr('y', cellRect.height * -0.5)
    .attr('width', svgChartWidth - charPd.left - charPd.right)
    .attr('height', svgChartHeight - charPd.top - charPd.bottom)
  const gridOuterWrap = chartGroup.append('g').attr('clip-path', clip)
  gridWrap = gridOuterWrap.append('g')
  gridWrap
    .append('rect')
    .attr('width', cellRect.width * (cols + 0.5))
    .attr('height', cellRect.width * (rows + 0.5))
    .attr('x', 0)
    .attr('y', -cellRect.height * 0.5)
    .attr('fill', 'transparent')
  gridWrap.call(d3.drag().on('start', handleStart).on('drag', handleDrag).on('end', handleEnd))

  // 散点
  const cxScale = d3
    .scaleLinear()
    .domain([0, cols])
    .range([0, cellRect.width * cols])
  gridWrap
    .selectAll('circle')
    .data(d3.range(rows * cols))
    .enter()
    .append('circle')
    .attr('cx', (d, i) => cxScale((i % cols) + 1))
    .attr('cy', (d, i) => yScale(Math.floor(i / cols) + 1))
    .attr('r', (d, i) => getRadioByABSLog2fc(i % cols, Math.floor(i / cols)))
    .attr('data-log2fc', (d, i) => getLog2FCValue(i % cols, Math.floor(i / cols)))
    .attr('fill', (d, i) => getColorByLog2FC(i % cols, Math.floor(i / cols)))
}

let prevTransXRound,
  currTransXRound = 0

function generateXAxisGroup() {
  if (prevTransXRound === currTransXRound) return
  prevTransXRound = currTransXRound
  if (xAxisGroup) {
    xAxisGroup.selectAll('*').remove()
  } else {
    xAxisGroup = chartGroup.append('g').attr('transform', `translate(0, ${cellRect.width * rows})`)
  }
  const xScale = d3
    .scaleLinear()
    .domain([0, showCols])
    .range([0, cellRect.width * showCols])
  const xAxis = d3
    .axisBottom(xScale)
    .tickValues(d3.range(0, showCols + 1))
    .tickFormat(x => (x ? compoundList[x - 1 - currTransXRound] : ''))
    .tickSizeOuter(0)
  xAxisGroup
    .call(xAxis)
    .selectAll('text')
    .attr('width', 20)
    .attr('visibility', 'visible')
    .attr('text-anchor', 'end') // .attr('transform-origin', 'right top')
    .attr('transform', 'translate(-5,0) rotate(-45)')
    .attr('data-idx', (d, i) => i - 1)
    .style('cursor', 'pointer')
}

function handleStart(e) {
  // console.log('handleStart:', e)
}
function handleDrag(e) {
  // console.log('handleDrag:', e)
  gridWrap.attr('transform', getNewTransByOffset(e))
  generateXAxisGroup()
  percent.value = Math.round((-currTransXRound / (cols - showCols)) * 100)
}
function handleEnd(e) {
  // console.log('handleEnd:', e)
  gridWrap.attr('transform', getNewTransByOffset(e, true))
  generateXAxisGroup()
  percent.value = Math.round((-currTransXRound / (cols - showCols)) * 100)
}
function getNewTransByOffset(e, round = false) {
  const currTransX = gridWrap.attr('transform')?.match(/translate\(([+-\w]+),\s?\w+\)/)?.[1] || 0
  let newTransX = parseFloat(currTransX) + (e?.dx ?? 0)
  // 边界
  if (newTransX > 0) newTransX = 0
  else if (-newTransX > (cols - showCols) * cellRect.width)
    newTransX = -(cols - showCols) * cellRect.width
  // 取整
  currTransXRound = Math.round(newTransX / cellRect.width)
  if (round) newTransX = currTransXRound * cellRect.width
  return `translate(${newTransX}, 0)`
}

const percent = ref(0)
function handleJumpTo(e) {
  let newTransX = -((cols - showCols) * cellRect.width * +percent.value) / 100
  // 取整
  currTransXRound = Math.round(newTransX / cellRect.width)
  newTransX = currTransXRound * cellRect.width
  gridWrap.attr('transform', `translate(${newTransX}, 0)`)
  generateXAxisGroup()
}

var count = 0

function uid(name) {
  return new Id('O-' + (name == null ? '' : name + '-') + ++count)
}

function Id(id) {
  this.id = id
  this.href = new URL(`#${id}`, location) + ''
}

Id.prototype.toString = function () {
  return 'url(' + this.href + ')'
}
</script>

<template>
  <div>
    <div ref="chartRef" class="heatmap-chart"></div>
    <input v-model="percent" @input="handleJumpTo" type="range" min="0" :max="100" />
    <!-- <h3>Tips:</h3>
    <ul class="no-marker">
      <li>添加二维坐标系，绘制热力图及图例</li>
    </ul> -->
  </div>
</template>
<style lang="scss" scoped>
.heatmap-chart {
  min-height: 280px;
  overflow: auto;
  position: relative;
}
:deep(svg) {
  overflow: visible;
}
</style>

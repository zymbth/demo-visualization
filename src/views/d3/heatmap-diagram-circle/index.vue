<script setup>
import { myIsNumber } from '@/utils/common-methods'
import data from './data.json'

const heatmap = ref(data)

const chartRef = ref()

onMounted(() => {
  generateD3()
})

const radius = 8

// [0, 4] => [1, radius]
const calcSpotRadius = val => {
  // 非数字返回透明色
  if (!myIsNumber(val)) return 0
  return d3.scaleLinear().domain([0, 4]).range([3, radius]).clamp(true)(Math.abs(val))
}
// 根据log2fc绝对值大小获取对应的半径 [0, 4] => [1, radius]
const getSpotRadius = (x, y) => {
  const val = heatmap.value[y].compounds[x].value?.log2_fc
  return calcSpotRadius(val)
}

const getLog2FCValue = (x, y) => {
  return heatmap.value[y].compounds[x].value?.log2_fc
}
// 根据值区间[-4,4]从颜色区间['#663d71', '#ddd3e1']中获取对应的颜色
const log2FCColorRange = ['#c33726', '#e2e2e2', '#2d85c5'] // ['#663d71', '#ddd3e1']
const getSpotColor = (x, y) => {
  const val = heatmap.value[y].compounds[x].value?.log2_fc
  // 非数字返回透明色
  if (!myIsNumber(val)) return 'transparent'
  if (val == 0) return log2FCColorRange[1]
  if (val > 0) return log2FCColorRange[0]
  return log2FCColorRange[2]
}

// 根据横轴compound的索引获取compound的名称
const getCompoundName = x => {
  return heatmap.value[0]?.compounds[x - 1]?.compound ?? ''
}

// 根据纵轴gene的索引获取gene的名称
const getGeneName = y => {
  return heatmap.value[y - 1]?.gene ?? ''
}

// 散点尺寸
const cellSize = { width: 19, height: 19 }
// 图表边距
const charPd = { top: 70, right: 20, bottom: 170, left: 110 }

/**
 * 使用 d3.js 创建 heatmap.value 对应的一个直角坐标系，x轴为compound，y轴为gene，
 * 每个单元格内放置圆形，使用log10_qvalue作为圆形的半径大小
 */
function generateD3() {
  if (!(heatmap.value instanceof Array) || heatmap.value.length === 0) {
    console.error('heatmap date is empty')
  }
  const svg = d3.select(chartRef.value).append('svg')
  // 散点行列数
  const rows = heatmap.value.length
  const cols = heatmap.value[0]?.compounds?.length ?? 0
  // svg 表格宽高
  const svgChartWidth = cellSize.width * cols + charPd.left + charPd.right
  const svgChartHeight = cellSize.height * rows + charPd.top + charPd.bottom
  // svg
  svg.selectAll('*').remove()
  svg
    .attr('width', Math.max(560, svgChartWidth)) // 最小宽度 560px
    .attr('height', svgChartHeight)
    .attr('overflow', 'visible')

  // chart
  const g = svg.append('g').attr('transform', `translate(${charPd.left}, ${charPd.top})`)
  // 坐标轴
  const xScale = d3
    .scaleLinear()
    .domain([0, cols])
    .range([0, cellSize.width * cols])
  const yScale = d3
    .scaleLinear()
    .domain([0, rows])
    .range([cellSize.width * rows, 0])
  const xAxis = d3
    .axisBottom(xScale)
    .tickValues(d3.range(0, cols + 1))
    .tickFormat(getCompoundName)
    .tickSizeOuter(0)
  const yAxis = d3
    .axisLeft(yScale)
    .tickValues(d3.range(0, rows + 1))
    .tickFormat(getGeneName)
    .tickSizeOuter(0)
  const xAxisGroup = g.append('g').attr('transform', `translate(0, ${cellSize.width * rows})`)
  xAxisGroup
    .call(xAxis)
    .selectAll('text')
    .attr('width', 20)
    .attr('visibility', 'visible')
    .attr('text-anchor', 'end') // .attr('transform-origin', 'right top')
    .attr('transform', 'translate(-5,0) rotate(-45)')
    .attr('data-idx', (d, i) => i - 1)
    .style('cursor', 'pointer')
  const yAxisGroup = g.append('g')
  yAxisGroup.call(yAxis).selectAll('text').classed('gene-text', true)
  // circles in cells
  g.selectAll('circle')
    .data(d3.range(rows * cols))
    .enter()
    .append('circle')
    .attr('cx', (d, i) => xScale((i % cols) + 1))
    .attr('cy', (d, i) => yScale(Math.floor(i / cols) + 1))
    .attr('r', (d, i) => getSpotRadius(i % cols, Math.floor(i / cols)))
    .attr('data-log2fc', (d, i) => getLog2FCValue(i % cols, Math.floor(i / cols)))
    .attr('fill', (d, i) => getSpotColor(i % cols, Math.floor(i / cols)))

  // 图例：log2fc
  const legendLog2FC = svg.append('g')
  let xPosi = 20,
    yPosi = 10
  legendLog2FC
    .append('text')
    .attr('x', xPosi)
    .attr('y', yPosi + 14)
    .text('|log2FC|:')
    .attr('font-size', 14)
    .attr('font-weight', 'bold')
  legendLog2FC
    .append('rect')
    .attr('x', (xPosi += 58))
    .attr('y', yPosi)
    .attr('width', 102)
    .attr('height', 20)
    .attr('fill', '#f2f2f2')
  legendLog2FC
    .append('circle')
    .attr('cx', (xPosi += 10))
    .attr('cy', yPosi + 10)
    .attr('r', calcSpotRadius(0))
    .attr('fill', '#030000')
  legendLog2FC
    .append('circle')
    .attr('cx', (xPosi += 20))
    .attr('cy', yPosi + 10)
    .attr('r', calcSpotRadius(1))
    .attr('fill', '#030000')
  legendLog2FC
    .append('circle')
    .attr('cx', (xPosi += 20))
    .attr('cy', yPosi + 10)
    .attr('r', calcSpotRadius(2))
    .attr('fill', '#030000')
  legendLog2FC
    .append('circle')
    .attr('cx', (xPosi += 20))
    .attr('cy', yPosi + 10)
    .attr('r', calcSpotRadius(3))
    .attr('fill', '#030000')
  legendLog2FC
    .append('circle')
    .attr('cx', (xPosi += 20))
    .attr('cy', yPosi + 10)
    .attr('r', calcSpotRadius(4))
    .attr('fill', '#030000')
  xPosi = 20
  legendLog2FC
    .append('text')
    .attr('x', (xPosi += 58 + 7))
    .attr('y', yPosi + 36)
    .text('0')
    .attr('font-size', 12)
  legendLog2FC
    .append('text')
    .attr('x', (xPosi += 20))
    .attr('y', yPosi + 36)
    .text('1')
    .attr('font-size', 12)
  legendLog2FC
    .append('text')
    .attr('x', (xPosi += 20))
    .attr('y', yPosi + 36)
    .text('2')
    .attr('font-size', 12)
  legendLog2FC
    .append('text')
    .attr('x', (xPosi += 20))
    .attr('y', yPosi + 36)
    .text('3')
    .attr('font-size', 12)
  legendLog2FC
    .append('text')
    .attr('x', (xPosi += 15))
    .attr('y', yPosi + 36)
    .text('>=4')
    .attr('font-size', 12)

  // 图例： Down regulated
  const legendDR = svg.append('g')
  xPosi = 220
  legendDR
    .append('text')
    .attr('x', xPosi)
    .attr('y', yPosi + 14)
    .text('Down-regulated:')
    .attr('font-size', 14)
    .attr('font-weight', 'bold')
  legendDR
    .append('circle')
    .attr('cx', (xPosi += 120))
    .attr('cy', yPosi + 10)
    .attr('r', radius)
    .attr('fill', log2FCColorRange[2])
  // 图例： Up regulated
  const legendUR = svg.append('g')
  legendUR
    .append('text')
    .attr('x', (xPosi += 20))
    .attr('y', yPosi + 14)
    .text('Up-regulated:')
    .attr('font-size', 14)
    .attr('font-weight', 'bold')
  legendUR
    .append('circle')
    .attr('cx', (xPosi += 100))
    .attr('cy', yPosi + 10)
    .attr('r', radius)
    .attr('fill', log2FCColorRange[0])
}
</script>

<template>
  <div>
    <div ref="chartRef" class="heatmap-chart"></div>
    <h3>Tips:</h3>
    <ul class="no-marker">
      <li>添加二维坐标系，绘制热力图及图例</li>
    </ul>
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

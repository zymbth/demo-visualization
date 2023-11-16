<script setup>
import { ref, watch, onMounted } from 'vue'
import { myIsNumber } from '@/utils/common-methods'
import exportSvgToPng from '@/utils/export-svg-to-png'
import ContextMenuComp from '@/components/ContextMenu/index.vue'
import data from './data.json'

const heatmap = ref(data) // 二维热力图数据
const highlightCompounds = ref([]) // 高亮 compounds 列表

const chartRef = ref()

onMounted(() => {
  generateD3()
  // 更新高亮列
  watch(highlightCompounds, newVal => highlightCompoundCol(newVal))
})

// compound 详情页链接
const { origin, pathname } = window.location
let link = origin + pathname + '#/target-identification/splicing-discovery'

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

// 根据横轴compound的索引获取compound的名称
const getCompoundName = x => {
  return heatmap.value[0]?.compounds[x - 1]?.compound ?? ''
}

// 根据纵轴gene的索引获取gene的名称
const getGeneName = y => {
  return heatmap.value[y - 1]?.gene ?? ''
}

// 散点尺寸
const cellRect = { width: 19, height: 19 }
// 图表边距
const charPd = { top: 70, right: 20, bottom: 170, left: 110 }
// 分别声明：geneActy 图例，svg主表格group，横纵轴group
let legendGeneActy, svgMainGroup, xAxisGroup, yAxisGroup

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
  const svgChartWidth = cellRect.width * cols + charPd.left + charPd.right
  const svgChartHeight = cellRect.height * rows + charPd.top + charPd.bottom
  // svg
  svg.selectAll('*').remove()
  svg
    .attr('width', Math.max(560, svgChartWidth)) // 最小宽度 560px
    .attr('height', svgChartHeight)
    .attr('overflow', 'visible')

  // chart
  const g = svg.append('g').attr('transform', `translate(${charPd.left}, ${charPd.top})`)
  svgMainGroup = g
  // 坐标轴
  const xScale = d3
    .scaleLinear()
    .domain([0, cols])
    .range([0, cellRect.width * cols])
  const yScale = d3
    .scaleLinear()
    .domain([0, rows])
    .range([cellRect.width * rows, 0])
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
  xAxisGroup = g.append('g').attr('transform', `translate(0, ${cellRect.width * rows})`)
  xAxisGroup
    .call(xAxis)
    .selectAll('text')
    .attr('width', 20)
    .attr('visibility', 'visible')
    .attr('text-anchor', 'end') // .attr('transform-origin', 'right top')
    .attr('transform', 'translate(-5,0) rotate(-45)')
    .attr('data-idx', (d, i) => i - 1)
    .style('cursor', 'pointer')
    .on('click', (d, i) => {
      const compound = heatmap.value[0]?.compounds?.[i - 1]?.compound
      if (compound) {
        const url = `${link}/${compound}/`
        location.href = url // window.open(url)
      }
    })
  yAxisGroup = g.append('g')
  yAxisGroup.call(yAxis).selectAll('text').classed('gene-text', true)
  // circles in cells
  g.selectAll('circle')
    .data(d3.range(rows * cols))
    .enter()
    .append('circle')
    .attr('cx', (d, i) => xScale((i % cols) + 1))
    .attr('cy', (d, i) => yScale(Math.floor(i / cols) + 1))
    .attr('r', (d, i) => getRadioByABSLog2fc(i % cols, Math.floor(i / cols)))
    .attr('data-log2fc', (d, i) => getLog2FCValue(i % cols, Math.floor(i / cols)))
    .attr('fill', (d, i) => getColorByLog2FC(i % cols, Math.floor(i / cols)))

  // 预先定义linearGradient
  const defs1 = svg.append('defs')
  defs1
    .append('linearGradient')
    .attr('id', 'htt-linear-gradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '100%')
    .attr('y2', '0%')
    .selectAll('stop')
    .data([
      { offset: '0%', color: log2FCColorRange[2] },
      { offset: '50%', color: log2FCColorRange[1] },
      { offset: '100%', color: log2FCColorRange[0] },
    ])
    .enter()
    .append('stop')
    .attr('offset', d => d.offset)
    .attr('stop-color', d => d.color)
    .attr('stop-opacity', 1)

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
    .attr('r', calcLog2fcRadio(0))
    .attr('fill', '#030000')
  legendLog2FC
    .append('circle')
    .attr('cx', (xPosi += 20))
    .attr('cy', yPosi + 10)
    .attr('r', calcLog2fcRadio(1))
    .attr('fill', '#030000')
  legendLog2FC
    .append('circle')
    .attr('cx', (xPosi += 20))
    .attr('cy', yPosi + 10)
    .attr('r', calcLog2fcRadio(2))
    .attr('fill', '#030000')
  legendLog2FC
    .append('circle')
    .attr('cx', (xPosi += 20))
    .attr('cy', yPosi + 10)
    .attr('r', calcLog2fcRadio(3))
    .attr('fill', '#030000')
  legendLog2FC
    .append('circle')
    .attr('cx', (xPosi += 20))
    .attr('cy', yPosi + 10)
    .attr('r', calcLog2fcRadio(4))
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
    .attr('r', circleRadius)
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
    .attr('r', circleRadius)
    .attr('fill', log2FCColorRange[0])
  // 图例: HTT activity
  legendGeneActy = svg.append('g')
  xPosi = 500
  legendGeneActy
    .append('text')
    .attr('x', xPosi)
    .attr('y', yPosi + 14)
    .text('Target EC50:')
    .attr('font-size', 14)
    .attr('font-weight', 'bold')
  legendGeneActy
    .append('text')
    .attr('x', (xPosi += 88))
    .attr('y', yPosi + 14)
    .text('Negative')
    .attr('font-size', 14)
    .attr('font-weight', 'bold')
  legendGeneActy
    .append('rect')
    .attr('x', (xPosi += 58))
    .attr('y', yPosi)
    .attr('width', 100)
    .attr('height', 16)
    .attr('fill', 'url(#htt-linear-gradient)')
  legendGeneActy
    .append('text')
    .attr('x', xPosi + 102)
    .attr('y', yPosi + 14)
    .text('Potent')
    .attr('font-size', 14)
    .attr('font-weight', 'bold')

  highlightCompoundCol()
}
// 高亮指定 compounds “列”
function highlightCompoundCol(arr = highlightCompounds.value) {
  const compoundsList = heatmap.value?.[0]?.compounds?.map(c => c.compound) ?? []
  if (compoundsList.length === 0 || !(arr instanceof Array) || arr.length === 0) return
  // 高亮“列”处理
  const compounds = [...new Set(arr)]
    .map(c => {
      return {
        idx: compoundsList.indexOf(c) ?? -1,
        compound: c,
      }
    })
    .filter(c => c.idx > -1)
  // console.log('highlight compounds:', compounds)

  const rows = heatmap.value.length
  const cols = heatmap.value[0]?.compounds?.length ?? 0
  // 坐标轴
  const xScale = d3
    .scaleLinear()
    .domain([0, cols])
    .range([0, cellRect.width * cols])
  // 根据类标识，移除老的高亮“列”
  svgMainGroup.selectAll('.third-column').remove()
  // 添加新的高亮“列”
  svgMainGroup
    .selectAll('.third-column')
    .data(compounds)
    .enter()
    .append('rect') // 在指定列上添加 rect 元素
    .attr('class', 'third-column') // 类标识
    .attr('x', (d, i) => xScale(d.idx) + cellRect.height / 2)
    .attr('y', 0 - cellRect.height / 2)
    .attr('width', cellRect.width)
    .attr('height', cellRect.width * (rows + 0.5))
    .attr('fill', 'rgba(255, 197, 34, 0.5)') // 填充 rect 颜色
    .lower() // 移动到其同级元素的最前面，避免覆盖坐标系内的 circles

  // x 轴 label 高亮
  xAxisGroup.selectAll('text').style('color', 'initial')
  xAxisGroup
    .selectAll('text')
    .filter(function () {
      const currIdx = d3.select(this).attr('data-idx')
      return !!compounds.find(c => c.idx == currIdx)
    })
    .style('color', '#ffc522')
}

// 右键菜单：导出 svg 为图片
const handleDownload = (imageType = 'image/jpeg') => {
  exportSvgToPng('.heatmap-chart svg', '', { imageType })
}
const showMenu = ref(false),
  contextMenuRef = ref()
const handleContextMenu = event => {
  contextMenuRef.value.positionMenu(event)
  showMenu.value = true
}

function handleRandomHighlight() {
  const compoundsList = heatmap.value?.[0]?.compounds?.map(c => c.compound) ?? []
  highlightCompounds.value = compoundsList.filter(_ => Math.random() > 0.7)
}
</script>

<template>
  <div>
    <div ref="chartRef" class="heatmap-chart" @contextmenu.prevent="handleContextMenu">
      <!-- 右键菜单框 -->
      <ContextMenuComp v-model="showMenu" ref="contextMenuRef">
        <div class="menu-item" @click="handleDownload('image/jpeg')">Download jpeg</div>
        <div class="menu-item" @click="handleDownload('image/png')">Download png</div>
      </ContextMenuComp>
    </div>
    <hr />
    <button @click="handleRandomHighlight">Highlight Random Columns</button>
    <h3>Notes:</h3>
    <ul class="no-marker">
      <li>添加二维坐标系，绘制热力图及图例</li>
      <li>添加右键菜单，可保存为图片</li>
      <li>添加高亮“列”功能</li>
    </ul>
  </div>
</template>
<style lang="scss" scoped>
.heatmap-chart {
  position: relative;
  width: 100%;
  min-height: 280px;
  overflow: auto;
  &:deep svg {
    overflow: visible;
  }
}
</style>

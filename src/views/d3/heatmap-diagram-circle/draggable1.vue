<script setup>
import { myIsNumber } from '@/utils/common-methods'
import data from './data.json'

onMounted(() => {
  const chart = new DraggableChart({ data: data, chartEl: '.heatmap-chart' })
  // generateD3()
  chart.drawChart()
})

class DraggableChart {
  constructor({ data, chartEl }) {
    this.circleRadius = 8
    this.cellRect = { width: 20, height: 20 }
    this.charPd = { top: 70, right: 20, bottom: 170, left: 110 }

    this.chartEl = chartEl

    if (!(data instanceof Array) || data.length === 0) {
      console.error('heatmap date is empty')
    }
    this.data = data
    this.geneList = data.map(p => p.gene) || []
    this.compoundList = data[0]?.compounds?.map(p => p.compound) || []
    // 散点行列数
    this.rows = this.geneList.length
    this.cols = this.compoundList.length
    this.showCols = Math.min(this.cols, 30)

    this.svg = d3.select(this.chartEl).append('svg')
  }

  drawChart() {
    // svg 表格宽高
    const svgChartWidth = this.cellRect.width * this.showCols + this.charPd.left + this.charPd.right
    const svgChartHeight = this.cellRect.height * this.rows + this.charPd.top + this.charPd.bottom
    // svg
    this.svg.selectAll('*').remove()
    this.svg
      .attr('width', Math.max(560, svgChartWidth)) // 最小宽度 560px
      .attr('height', svgChartHeight)
      .attr('overflow', 'visible')
    // chart
    this.chartGroup = this.svg
      .append('g')
      .attr('transform', `translate(${this.charPd.left}, ${this.charPd.top})`)
    // 坐标轴
    this.xAxisG = new XAxis({
      data: this.compoundList,
      chart: this.chartGroup,
      cellRect: this.cellRect,
      rows: this.rows,
      showCols: this.showCols,
    })
    this.yAxisG = new YAxis({
      data: this.geneList,
      chart: this.chartGroup,
      cellRect: this.cellRect,
      rows: this.rows,
    })
    this.generateXAxisGroup()
    this.generateYAxisGroup()
    // 网格
    const clip = uid('heatmap-clipper')
    this.svg
      .append('clipPath')
      .attr('id', clip.id)
      .append('rect')
      .attr('x', this.cellRect.width * 0.5)
      .attr('y', this.cellRect.height * -0.5)
      .attr('width', svgChartWidth - this.charPd.left - this.charPd.right)
      .attr('height', svgChartHeight - this.charPd.top - this.charPd.bottom)
    const gridOuterWrap = this.chartGroup.append('g').attr('clip-path', clip)
    this.gridWrap = gridOuterWrap.append('g')
    this.gridWrap
      .append('rect')
      .attr('width', this.cellRect.width * (this.cols + 0.5))
      .attr('height', this.cellRect.width * (this.rows + 0.5))
      .attr('x', 0)
      .attr('y', -this.cellRect.height * 0.5)
      .attr('fill', 'transparent')
    this.gridWrap.call(
      d3
        .drag()
        .on('start', this.handleStart.bind(this))
        .on('drag', this.handleDrag.bind(this))
        .on('end', this.handleEnd.bind(this))
    )
    // 散点
    const cxScale = d3
      .scaleLinear()
      .domain([0, this.cols])
      .range([0, this.cellRect.width * this.cols])
    const cyScale = d3
      .scaleLinear()
      .domain([0, this.rows])
      .range([this.cellRect.width * this.rows, 0])
    this.gridWrap
      .selectAll('circle')
      .data(d3.range(this.rows * this.cols))
      .enter()
      .append('circle')
      .attr('cx', (d, i) => cxScale((i % this.cols) + 1))
      .attr('cy', (d, i) => cyScale(Math.floor(i / this.cols) + 1))
      .attr('r', (d, i) => this.getRadioByABSLog2fc(i % this.cols, Math.floor(i / this.cols)))
      .attr('data-log2fc', (d, i) => this.getLog2FCValue(i % this.cols, Math.floor(i / this.cols)))
      .attr('fill', (d, i) => this.getColorByLog2FC(i % this.cols, Math.floor(i / this.cols)))
  }

  handleStart(e) {}
  handleDrag(e) {
    // console.log('handleDrag:', e)
    this.gridWrap.attr('transform', this.getNewTransByOffset(e))
    this.generateXAxisGroup()
    this.percent = Math.round((-this.xAxisG.currOffset / (this.cols - this.showCols)) * 100)
  }
  handleEnd(e) {
    // console.log('handleEnd:', e)
    this.gridWrap.attr('transform', this.getNewTransByOffset(e, true))
    this.generateXAxisGroup()
    this.percent = Math.round((-this.xAxisG.currOffset / (this.cols - this.showCols)) * 100)
  }
  getNewTransByOffset(e, round = false) {
    const currTransX =
      this.gridWrap.attr('transform')?.match(/translate\(([+-\w]+),\s?\w+\)/)?.[1] || 0
    let newTransX = parseFloat(currTransX) + (e?.dx ?? 0)
    // 边界
    if (newTransX > 0) newTransX = 0
    else if (-newTransX > (this.cols - this.showCols) * this.cellRect.width)
      newTransX = -(this.cols - this.showCols) * this.cellRect.width
    // 取整
    this.xAxisG.currOffset = Math.round(newTransX / this.cellRect.width)
    if (round) newTransX = this.xAxisG.currOffset * this.cellRect.width
    return `translate(${newTransX}, 0)`
  }

  generateXAxisGroup() {
    this.xAxisG.generate()
  }
  generateYAxisGroup() {
    this.yAxisG.generate()
  }

  // [0, 4] => [1, circleRadius]
  calcLog2fcRadio(val) {
    // 非数字返回透明色
    if (!myIsNumber(val)) return 0
    return d3.scaleLinear().domain([0, 4]).range([3, this.circleRadius]).clamp(true)(Math.abs(val))
  }

  // 根据log2fc绝对值大小获取对应的半径 [0, 4] => [1, circleRadius]
  getRadioByABSLog2fc(x, y) {
    const val = this.data[y].compounds[x].value?.log2_fc
    return this.calcLog2fcRadio(val)
  }

  getLog2FCValue = (x, y) => {
    return this.data[y].compounds[x].value?.log2_fc
  }

  // 根据值区间[-4,4]从颜色区间['#663d71', '#ddd3e1']中获取对应的颜色
  static log2FCColorRange = ['#c33726', '#e2e2e2', '#2d85c5'] // ['#663d71', '#ddd3e1']
  getColorByLog2FC(x, y) {
    const val = this.data[y].compounds[x].value?.log2_fc
    // 非数字返回透明色
    if (!myIsNumber(val)) return 'transparent'
    if (val == 0) return DraggableChart.log2FCColorRange[1]
    if (val > 0) return DraggableChart.log2FCColorRange[0]
    return DraggableChart.log2FCColorRange[2]
  }
}

class XAxis {
  constructor({ data, chart, cellRect, rows, showCols }) {
    this.compoundList = data
    this.chart = chart
    this.cellRect = cellRect
    this.rows = rows
    this.showCols = showCols

    this.g = undefined
    this.prevOffset = undefined
    this.currOffset = 0
  }
  generate() {
    if (this.prevOffset === this.currOffset) return
    this.prevOffset = this.currOffset
    if (this.g) {
      this.g.selectAll('*').remove()
    } else {
      this.g = this.chart
        .append('g')
        .attr('transform', `translate(0, ${this.cellRect.width * this.rows})`)
    }
    const xScale = d3
      .scaleLinear()
      .domain([0, this.showCols])
      .range([0, this.cellRect.width * this.showCols])
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(d3.range(0, this.showCols + 1))
      .tickFormat(x => (x ? this.compoundList[x - 1 - this.currOffset] : ''))
      .tickSizeOuter(0)
    this.g
      .call(xAxis)
      .selectAll('text')
      .attr('width', 20)
      .attr('visibility', 'visible')
      .attr('text-anchor', 'end') // .attr('transform-origin', 'right top')
      .attr('transform', 'translate(-5,0) rotate(-45)')
      .attr('data-idx', (d, i) => i - 1)
      .style('cursor', 'pointer')
  }
}

class YAxis {
  constructor({ data, chart, cellRect, rows }) {
    this.geneList = data
    this.chart = chart
    this.cellRect = cellRect
    this.rows = rows

    this.g = undefined
    this.prevOffset = undefined
    this.currOffset = 0
  }
  generate() {
    const yScale = d3
      .scaleLinear()
      .domain([0, this.rows])
      .range([this.cellRect.width * this.rows, 0])
    const yAxis = d3
      .axisLeft(yScale)
      .tickValues(d3.range(0, this.rows + 1))
      .tickFormat(y => this.geneList[y - 1] || '')
      .tickSizeOuter(0)
    this.g = this.chart.append('g')
    this.g.call(yAxis).selectAll('text').classed('gene-text', true)
  }
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

// const percent = ref(0)
// function handleJumpTo(e) {
//   let newTransX = -((cols - showCols) * cellRect.width * +percent.value) / 100
//   // 取整
//   currTransXRound = Math.round(newTransX / cellRect.width)
//   newTransX = currTransXRound * cellRect.width
//   gridWrap.attr('transform', `translate(${newTransX}, 0)`)
//   generateXAxisGroup()
// }
</script>

<template>
  <div>
    <div ref="chartRef" class="heatmap-chart"></div>
    <!-- <input v-model="percent" @input="handleJumpTo" type="range" min="0" :max="100" /> -->
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

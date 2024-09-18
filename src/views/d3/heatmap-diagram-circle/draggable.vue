<script setup>
import data from './data.json'
import { myIsNumber, debounce } from '@/utils/common-methods'
import { uid } from '@/utils/uid'
import { useResizeObserver } from '@vueuse/core'

const chartWrapRef = ref()
const chartRef = ref()
let chart

onMounted(() => {
  chart = new DraggableChart({
    data: data,
    chartEl: chartRef.value,
    chartWrapEl: chartWrapRef.value,
    percent,
  })
  chart.drawChart()

  const debounceDraw = debounce(chart.drawChart, 150, chart)
  useResizeObserver(document.querySelector('.heatmap-chart'), entries => {
    const entry = entries[0]
    const { width } = entry.contentRect
    width && debounceDraw({ svgWrapWidth: width })
  })
})

class DraggableChart {
  constructor({ data, chartEl, chartWrapEl, percent }) {
    this.circleRadius = 8 // spot 半径
    this.cellRect = { width: 20, height: 20 } // cell 尺寸
    this.charPd = { top: 70, right: 20, bottom: 170, left: 110 } // 表格内边距

    this.chartEl = chartEl
    this.chartWrapEl = chartWrapEl
    if (!(data instanceof Array) || data.length === 0) {
      console.error('heatmap date is empty')
    }
    this.data = data
    this.percent = percent
    // svg element
    this.svg = d3.select(this.chartEl).append('svg')
    this.drawChart()
  }
  // 绘制SVG图
  drawChart({ data, svgWrapWidth } = {}) {
    if (data) {
      if (!(data instanceof Array) || data.length === 0) {
        console.error('heatmap date is empty')
      }
      this.data = data
    }
    this.geneList = this.data.map(p => p.gene) || []
    this.compoundList = this.data[0]?.compounds?.map(p => p.compound) || []
    // 散点行列数
    this.rows = this.geneList.length
    this.cols = this.compoundList.length
    this.showCols = Math.min(this.cols, 30)
    try {
      this.showCols = Math.min(
        this.cols,
        Math.floor(
          ((svgWrapWidth || this.chartWrapEl.offsetWidth || 800) -
            this.charPd.left -
            this.charPd.right) /
            this.cellRect.width -
            0.5
        )
      )
    } catch (error) {
      this.showCols = Math.min(cols, 30)
    }
    // svg
    this.svg.selectAll('*').remove() // 清除svg内容，重新绘制
    this.svg
      .attr(
        'width',
        Math.max(560, this.cellRect.width * this.showCols + this.charPd.left + this.charPd.right)
      ) // 最小宽度 560px
      .attr('height', this.cellRect.height * this.rows + this.charPd.top + this.charPd.bottom)
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
    /* 图表网格 */
    // 裁剪路径clipPath
    const clip = uid('heatmap-clipper')
    this.svg
      .append('clipPath')
      .attr('id', clip.id)
      .append('rect') // 使用矩形裁剪路径
      // 定位
      .attr('x', this.cellRect.width * 0.5)
      .attr('y', this.cellRect.height * -0.5)
      // 尺寸
      .attr('width', this.cellRect.width * this.showCols)
      .attr('height', this.cellRect.height * this.rows)
    // 网格外包围组，用于应用clipPath
    const gridOuterWrap = this.chartGroup.append('g').attr('clip-path', clip)
    // 网格组
    this.gridWrap = gridOuterWrap.append('g')
    // 网格内定义一个全覆盖矩阵作为背景，应用拖拽
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
    // 生成散点
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
      .attr('fill', (d, i) => this.getColorByLog2FC(i % this.cols, Math.floor(i / this.cols)))
    this.drawLegends()
  }

  handleStart(e) {}
  handleDrag(e) {
    this.gridWrap.attr('transform', this.getNewTransByOffset(e))
    this.xAxisG.generate()
    this.percent.value = Math.round((-this.xAxisG.currOffset / (this.cols - this.showCols)) * 100)
  }
  handleEnd(e) {
    this.gridWrap.attr('transform', this.getNewTransByOffset(e, true))
    this.xAxisG.generate()
    this.percent.value = Math.round((-this.xAxisG.currOffset / (this.cols - this.showCols)) * 100)
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
  // 横轴进度跳转
  xAxisJumpTo(val) {
    this.percent.value = val
    let newTransX = -((this.cols - this.showCols) * this.cellRect.width * +this.percent.value) / 100
    // 取整
    this.xAxisG.currOffset = Math.round(newTransX / this.cellRect.width)
    newTransX = this.xAxisG.currOffset * this.cellRect.width
    this.gridWrap.attr('transform', `translate(${newTransX}, 0)`)
    this.xAxisG.generate()
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

  // 绘制图例
  /* eslint-disable */
  // prettier-ignore
  drawLegends() {
    let xPosi = 20, yPosi = 10
    // 图例：log2fc
    const legdLog2FC = this.svg.append('g')
    legdLog2FC.append('text').attr('x', xPosi).attr('y', yPosi + 14).text('|log2FC|:').attr('font-size', 14).attr('font-weight', 'bold')
    legdLog2FC.append('rect').attr('x', (xPosi += 58)).attr('y', yPosi).attr('width', 102).attr('height', 20).attr('fill', '#f2f2f2')
    legdLog2FC.append('circle').attr('cx', (xPosi += 10)).attr('cy', yPosi + 10).attr('r', this.calcLog2fcRadio(0)).attr('fill', '#030000')
    legdLog2FC.append('circle').attr('cx', (xPosi += 20)).attr('cy', yPosi + 10).attr('r', this.calcLog2fcRadio(1)).attr('fill', '#030000')
    legdLog2FC.append('circle').attr('cx', (xPosi += 20)).attr('cy', yPosi + 10).attr('r', this.calcLog2fcRadio(2)).attr('fill', '#030000')
    legdLog2FC.append('circle').attr('cx', (xPosi += 20)).attr('cy', yPosi + 10).attr('r', this.calcLog2fcRadio(3)).attr('fill', '#030000')
    legdLog2FC.append('circle').attr('cx', (xPosi += 20)).attr('cy', yPosi + 10).attr('r', this.calcLog2fcRadio(4)).attr('fill', '#030000')
    xPosi = 20
    legdLog2FC.append('text').attr('x', (xPosi += 58 + 7)).attr('y', yPosi + 36).text('0').attr('font-size', 12)
    legdLog2FC.append('text').attr('x', (xPosi += 20)).attr('y', yPosi + 36).text('1').attr('font-size', 12)
    legdLog2FC.append('text').attr('x', (xPosi += 20)).attr('y', yPosi + 36).text('2').attr('font-size', 12)
    legdLog2FC.append('text').attr('x', (xPosi += 20)).attr('y', yPosi + 36).text('3').attr('font-size', 12)
    legdLog2FC.append('text').attr('x', (xPosi += 15)).attr('y', yPosi + 36).text('>=4').attr('font-size', 12)
    // 图例： Down regulated
    xPosi = 220
    const legdDR = this.svg.append('g')
    legdDR.append('text').attr('x', xPosi).attr('y', yPosi + 14).text('Down-regulated:').attr('font-size', 14).attr('font-weight', 'bold')
    legdDR.append('circle').attr('cx', (xPosi += 120)).attr('cy', yPosi + 10).attr('r', this.circleRadius).attr('fill', DraggableChart.log2FCColorRange[2])
    // 图例： Up regulated
    const legdUR = this.svg.append('g')
    legdUR.append('text').attr('x', (xPosi += 20)).attr('y', yPosi + 14).text('Up-regulated:').attr('font-size', 14).attr('font-weight', 'bold')
    legdUR.append('circle').attr('cx', (xPosi += 100)).attr('cy', yPosi + 10).attr('r', this.circleRadius).attr('fill', DraggableChart.log2FCColorRange[0])
  }
  /* eslint-enable */
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
    this.generate()
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
    this.generate()
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

const percent = ref(0)
function handleJumpTo(e) {
  chart.xAxisJumpTo(percent.value)
}
</script>

<template>
  <div ref="chartWrapRef" class="chart-wrap">
    <div ref="chartRef" class="heatmap-chart"></div>
    <input v-model="percent" @input="handleJumpTo" type="range" min="0" :max="100" />
    <h3>Tips:</h3>
    <ul class="no-marker">
      <li>添加二维坐标系，绘制热力图及图例</li>
      <li>可横向<strong>拖拽</strong>网格，添加进度条，双向绑定图表横向滚动进度</li>
      <li>图表<strong>宽度自适应</strong>，自动调整显示的列数</li>
    </ul>
  </div>
</template>
<style lang="scss" scoped>
.chart-wrap {
  min-width: 600px;
  resize: horizontal;
  border: 1px solid gray;
  overflow: auto;
}
.heatmap-chart {
  min-height: 280px;
  overflow: auto;
  position: relative;
}
input[type='range'] {
  display: block;
  margin: 0 auto;
}
:deep(svg) {
  overflow: visible;
}
</style>

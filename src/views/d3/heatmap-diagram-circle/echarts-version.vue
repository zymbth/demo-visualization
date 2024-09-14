<script setup>
import { ref, watch } from 'vue'
import useListenPageResize from '@/use/useListenPageResize'
import data from './data.json'
import { myIsNumber } from '@/utils/common-methods'

const chartRef = ref()
let echartInstance, compoundsList

// set resize listener
const resizeEcharts = () => {
  echartInstance?.resize()
} // 图表重绘
useListenPageResize(resizeEcharts)

onMounted(() => {
  echartInstance = echarts.init(chartRef.value)
  drawChart()
  // 更新高亮列
  watch(highlightCompounds, newVal => highlightCompoundCol(newVal))
})

onBeforeUnmount(() => {
  echartInstance?.dispose()
})

const circleRadius = 8
const calcLog2fcRadio = val => {
  // 非数字返回透明色
  if (!myIsNumber(val)) return 0
  // return d3.scaleLinear().domain([0, 4]).range([3, circleRadius]).clamp(true)(Math.abs(val)) * 2
  val = Math.abs(val)
  if (val < 0) val = 0
  else if (val > 4) val = 4
  return (circleRadius * 2 - 6) * (val / 4) + 6
}

const log2FCColorRange = ['#c33726', '#e2e2e2', '#2d85c5']
const getColorByLog2FC = val => {
  // 非数字返回透明色
  if (!myIsNumber(val)) return 'transparent'
  if (val == 0) return log2FCColorRange[1]
  if (val > 0) return log2FCColorRange[0]
  return log2FCColorRange[2]
}

function drawChart() {
  const list = data.reduce((prev, curr, index) => {
    curr.compounds.reduce((prev1, curr1, index1) => {
      const { log2_fc, log10_qvalue } = curr1.value || {}
      prev1.push([index1 + 1, index + 1, log2_fc, log10_qvalue])
      return prev1
    }, prev)
    return prev
  }, [])
  const genes = data.map(g => g.gene)
  compoundsList = data[0].compounds?.map(c => c.compound)
  echartInstance.setOption({
    grid: { left: 150, top: 60, bottom: 200, height: 130, width: 500 },
    xAxis: {
      type: 'category',
      interval: 1,
      axisTick: {
        interval: 0,
        alignWithLabel: true,
      },
      axisLabel: {
        fontSize: 10,
        rotate: 30,
        interval: 0,
        formatter: value => compoundsList[value - 1],
      },
      splitLine: { show: false },
      z: 2,
    },
    yAxis: {
      interval: 1,
      axisLine: {
        show: true,
      },
      axisTick: {
        show: true,
      },
      axisLabel: {
        fontSize: 10,
        interval: 0,
        formatter: value => genes[value - 1],
      },
      splitLine: { show: false },
    },
    dataZoom: [
      {
        type: 'slider',
        show: true,
        minValueSpan: 20,
        maxValueSpan: 20,
        height: 16,
        bottom: 0,
        brushSelect: false,
        showDetail: false,
        showDataShadow: false,
        backgroundColor: 'rgb(255,255,255)',
      },
    ],
    series: [
      {
        // symbolSize: 20,
        data: list,
        type: 'scatter',
        name: 'test',
        symbolSize: value => calcLog2fcRadio(value[2]),
        itemStyle: {
          color: ({ data }) => getColorByLog2FC(data[2]),
        },
        markArea: {
          data: [[{ xAxis: 2, yAxis: 0 }, { xAxis: 2 }]],
          itemStyle: {
            color: '#ffe290',
            borderColor: '#ffe290',
            borderWidth: 16,
          },
        },
      },
    ],
  })
}

const highlightCompounds = ref([])
function handleRandomHighlight() {
  highlightCompounds.value = compoundsList.filter(_ => Math.random() > 0.7)
}

// 高亮指定 compounds “列”
function highlightCompoundCol() {
  const hlSpans = []
  let start = -1,
    end = -1
  for (let i = 0, len = compoundsList.length; i < len; i++) {
    const isCurrHl = highlightCompounds.value.includes(compoundsList[i])
    if (start === -1) {
      if (isCurrHl) start = end = i
    } else {
      if (isCurrHl) end = i
      else {
        hlSpans.push([start, end])
        start = end = -1
      }
    }
  }
  if (end !== -1) hlSpans.push([start, end])
  echartInstance.setOption({
    series: [
      {
        name: 'test',
        markArea: {
          data: hlSpans.map(([x, y]) => [{ xAxis: x }, { xAxis: y }]),
        },
      },
    ],
  })
}
</script>

<template>
  <div>
    <div class="chart-wrap" ref="chartRef"></div>
    <hr />
    <button @click="handleRandomHighlight">Highlight Random Columns</button>
    <h3>Tips:</h3>
    <ul class="no-marker">
      <li>热力图格式的散点图</li>
      <li>添加高亮“列”功能</li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.chart-wrap {
  height: calc(100vh - 218px);
  min-height: 300px;
  max-height: 400px;
}
.data-view-tb {
  margin-top: 24px;
}
</style>

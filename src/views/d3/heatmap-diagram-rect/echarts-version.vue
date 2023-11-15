<script setup>
import { ref, onMounted } from 'vue'
import useHandleListenPageSizeChange from '@/use/use-handle-listen-page-size-change'
import data from './data.json'

const heatmap = ref(data)

const heatmapRef = ref()

let heatmapChart
const legendColor = ['#2d85c5', '#e2e2e2', '#c33726']

onMounted(() => {
  // 初始化热力图
  heatmapChart = echarts.init(heatmapRef.value)
  drawHeatMap()
})

// 最大水平类目数
let maxHorizontalSpan = 30
// 更新最大水平类目数
function flushMaxHoriSpan() {
  // 获取 heatmap-wrap 宽度
  const wrapWidth = heatmapRef.value.clientWidth ?? 0
  maxHorizontalSpan = Math.ceil((wrapWidth - 170 - 50) / 20)
}
// 图表重绘
function resizeEcharts() {
  flushMaxHoriSpan()
  // 重绘热力图
  heatmapChart?.setOption({ dataZoom: getDataZoom('delta psi') })
  heatmapChart?.resize()
}
useHandleListenPageSizeChange(resizeEcharts)

// 获取热力图 dataZoom
function getDataZoom() {
  const compoundsLen = heatmap.value[0]?.compounds?.length ?? 0
  const regionsLen = heatmap.value.reduce((prev, curr) => {
    prev += curr.compounds?.length ?? 0
    return prev
  }, 0)
  return [
    {
      id: 'dataZoomX',
      show: compoundsLen > maxHorizontalSpan,
      minValueSpan: maxHorizontalSpan,
      maxValueSpan: maxHorizontalSpan,
    },
    {
      id: 'dataZoomY',
      show: regionsLen > 20,
    },
  ]
}

// 绘制热力图
function drawHeatMap() {
  flushMaxHoriSpan()

  const compoundList = heatmap.value[0]?.compounds?.map(c => c.compound) ?? []
  const data = heatmap.value.reduce((prev, curr, idx) => {
    curr.compounds?.forEach((c, idx1) => {
      prev.push([idx, idx1, c.value, c.qvalue, c.htt_activity, c.star])
    })
    return prev
  }, [])
  // grid
  const grid = { top: '40', bottom: '130', left: '200', right: '50' }
  if (heatmap.value.length < 10) grid.height = 20 * heatmap.value.length
  if (compoundList.length < 20) grid.width = 40 * compoundList.length
  // option
  const option = {
    title: { text: 'Delta psi:' },
    tooltip: {
      position: 'bottom',
      formatter: ({ data }) => {
        return `<table id="heatmap-tooltip-tb">
          <tbody>
            <tr>
              <td>Region</td>
              <td>${heatmap.value[data[0]]?.region ?? ''}</td>
            </tr>
            <tr>
              <td>Compound</td>
              <td>${heatmap.value[0]?.compounds?.[data[1]]?.compound ?? ''}</td>
            </tr>
            <tr>
              <td>Delta psi</td>
              <td>${data[2] ?? ''}</td>
            </tr>
            <tr>
              <td>qvalue</td>
              <td>${data[3] ?? ''}</td>
            </tr>
          </tbody>
        </table>`
      },
    },
    grid,
    dataZoom: [
      {
        id: 'dataZoomX',
        type: 'slider',
        show: compoundList.length > maxHorizontalSpan,
        orient: 'horizontal',
        minValueSpan: maxHorizontalSpan,
        maxValueSpan: maxHorizontalSpan,
        height: 16,
        bottom: 0,
        brushSelect: false,
        showDetail: false,
      },
      {
        id: 'dataZoomY',
        type: 'slider',
        show: data.length > 20,
        orient: 'vertical',
        minValueSpan: 20,
        maxValueSpan: 20,
        width: 16,
        right: 10,
        brushSelect: false,
        showDetail: false,
      },
    ],
    xAxis: {
      type: 'category',
      data: compoundList,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 10, rotate: 30, interval: 0 },
      splitLine: { show: true },
      triggerEvent: true,
    },
    yAxis: {
      type: 'category',
      data: heatmap.value.map(item => {
        let res = item.region
        if (item.location) res += `(${item.location})`
        if (item.type) res = `(${item.type})` + res
        return res
      }),
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 10, interval: 0 },
      splitLine: { show: true },
      triggerEvent: true,
    },
    visualMap: {
      top: 0,
      min: -1,
      max: 1,
      left: 90,
      dimension: 2,
      calculable: true,
      inRange: { color: legendColor },
      orient: 'horizontal',
      itemWidth: 12,
      itemHeight: 120,
    },
    series: [
      {
        type: 'heatmap',
        data: data,
        encode: { x: 1, y: 0 /* , tooltip: [2, 3, 4] */ },
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 900,
          lineHeight: 12,
          formatter: ({ data }) => {
            return Array.from({ length: data.at(-1) ?? 0 })
              .map(_ => '*')
              .join('')
          },
        },
        itemStyle: { shadowColor: 'rgba(0, 0, 0, 0.1)' },
        emphasis: {
          itemStyle: { color: 'inherit', shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.1)' },
        },
      },
    ],
  }
  // console.log(JSON.stringify(option))
  heatmapChart.setOption(option)
}
</script>
<template>
  <div ref="heatmapRef" class="target-heat-map" />
</template>
<style lang="scss" scoped>
.target-heat-map {
  height: 460px;
  width: 100%;
  min-width: 500px;
}
</style>
<style lang="scss">
#heatmap-tooltip-tb {
  thead {
    font-weight: bold;
  }
  th {
    padding: 2px 4px;
    text-align: left;
  }
  td {
    padding: 0px 4px;
  }
  tbody tr td:first-child {
    font-weight: bold;
    text-align: right;
  }
}
</style>

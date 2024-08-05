<script setup>
import { myIsNumber } from '@/utils/common-methods'
import originData from '@/views/d3/heatmap-diagram-rect/data.json'
import ChartThumb from './thumb.vue'

const chartRef = ref()

let echartInstance

onMounted(() => {
  // 初始化热力图
  echartInstance = echarts.init(chartRef.value)
  drawHeatMap()
  echartInstance.on('datazoom', params => {
    const { start, end, dataZoomId } = params ?? {}
    chartThumbRef.value?.setRectStart(start)
  })
})

onBeforeMount(() => {
  echartInstance?.dispose()
})

// 绘制热力图
function drawHeatMap() {
  const compoundList = originData[0]?.compounds?.map(c => c.compound) ?? []
  const seriesData = originData.reduce((prev, curr, idx) => {
    curr.compounds?.forEach((c, idx1) => {
      prev.push([idx, idx1, c.value, c.qvalue, c.htt_activity, c.star])
    })
    return prev
  }, [])
  // grid
  const grid = { top: '40', bottom: '130', left: '200', right: '50' }
  if (originData.length < 10) grid.height = 20 * originData.length
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
              <td>${originData[data[0]]?.region ?? ''}</td>
            </tr>
            <tr>
              <td>Compound</td>
              <td>${originData[0]?.compounds?.[data[1]]?.compound ?? ''}</td>
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
        show: compoundList.length > 30,
        orient: 'horizontal',
        minValueSpan: 30,
        maxValueSpan: 30,
        height: 16,
        bottom: 0,
        brushSelect: false,
        showDetail: false,
      },
      {
        id: 'dataZoomY',
        type: 'slider',
        show: seriesData.length > 20,
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
      data: originData.map(item => {
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
      inRange: { color: ['#2d85c5', '#e2e2e2', '#c33726'] },
      orient: 'horizontal',
      itemWidth: 12,
      itemHeight: 120,
    },
    series: [
      {
        type: 'heatmap',
        data: seriesData,
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
  echartInstance.setOption(option)
}

const chartThumbRef = ref()
function handleTrumbSelect(start) {
  if (!myIsNumber(start)) return
  echartInstance.dispatchAction({ type: 'dataZoom', start })
}
</script>
<template>
  <div>
    <div class="container">
      <div class="chart-wrap" ref="chartRef" />
      <ChartThumb
        ref="chartThumbRef"
        :data="originData"
        @select="handleTrumbSelect"
        :width="200"
        :height="100"
        :rect="30" />
    </div>
    <h3>Notes:</h3>
    <ul class="no-marker">
      <li>自定义一个svg缩略图，缩略图可鼠标滚动缩放、拖拽、区域选择以及区域双向联动</li>
    </ul>
  </div>
</template>
<style lang="scss" scoped>
.container {
  position: relative;
  width: 800px;
  overflow: visible;
}
.chart-wrap {
  width: 100%;
  height: 460px;
}
:deep(.trumb-container) {
  position: absolute;
  right: -120px;
  bottom: 30px;
}
</style>
<style lang="scss">
#echarts-tooltip-tb {
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

<script setup>
import { myIsNumber } from '@/utils/common-methods'
import originData from './data.json'
import ChartThumb from './thumb.vue'

const chartRef = ref()
let echartInstance

onMounted(() => {
  echartInstance = echarts.init(chartRef.value)

  const clusterList = originData[0].clusters?.map(c => c.cluster) || []
  const seriesData = originData.reduce((prev, curr, idx) => {
    curr.clusters?.forEach((c, idx1) => {
      prev.push([idx, idx1, c.value, c.cluster])
    })
    return prev
  }, [])
  const compoundList = originData.map(item => item.compound)
  const option = {
    tooltip: {
      position: 'bottom',
      formatter: ({ data }) => `<table id="echarts-tooltip-tb">
        <tbody>
          <tr>
            <td>Compound</td>
            <td>${data[data[0]]?.compound ?? ''}</td>
          </tr>
          <tr>
            <td>Target Cluster</td>
            <td>${data[0]?.clusters?.[data[1]]?.cluster ?? ''}</td>
          </tr>
          <tr>
            <td>Average dPSI</td>
            <td>${data[2] ?? ''}</td>
          </tr>
        </tbody>
      </table>`,
    },
    grid: {
      top: 36,
      bottom: 90,
      left: 100,
      right: 40,
    },
    dataZoom: [
      {
        id: 'dataZoomX',
        type: 'slider',
        show: compoundList.length > 40,
        orient: 'horizontal',
        minValueSpan: 40,
        maxValueSpan: 40,
        height: 16,
        bottom: 0,
        brushSelect: false,
        showDetail: false,
        backgroundColor: 'rgb(255,255,255)',
      },
      {
        id: 'dataZoomY',
        type: 'slider',
        show: clusterList.length > 20,
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
      axisLabel: {
        fontSize: 10,
        rotate: 60,
        interval: 0,
        color: 'rgb(110, 112, 121)',
      },
      splitLine: { show: true },
      // splitArea: { show: true, areaStyle: { color: ['#fff'] } },
      triggerEvent: true,
    },
    yAxis: {
      type: 'category',
      data: clusterList,
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        fontSize: 10,
        interval: 0,
        color: 'rgb(110, 112, 121)',
      },
      splitLine: { show: true },
      // splitArea: { show: true, areaStyle: { color: ['#fff'] } },
      triggerEvent: true,
    },
    visualMap: {
      type: 'continuous',
      // left: 110,
      top: 0,
      right: 40,
      min: -1,
      max: 1,
      precision: 2,
      dimension: 2,
      calculable: true,
      inRange: {
        color: [
          '#2d85c5',
          '#3ca9ee',
          '#61bdee',
          '#a5d3eb',
          '#e2e2e2',
          '#dfa693',
          '#dc6e55',
          '#e14b32',
          '#c33726',
        ],
      },
      text: ['', 'Average dPSI'],
      orient: 'horizontal',
      itemWidth: 12,
      itemHeight: 120,
    },
    series: [
      {
        name: 'ptc',
        type: 'heatmap',
        data: seriesData,
        encode: { x: 0, y: 1 /* , tooltip: [2, 3] */ },
        itemStyle: { shadowColor: 'rgba(0, 0, 0, 0.1)' },
        emphasis: {
          itemStyle: { color: 'inherit', shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.1)' },
        },
      },
    ],
  }
  echartInstance.setOption(option)
  echartInstance.on('datazoom', params => {
    const { start, end, dataZoomId } = params ?? {}
    chartThumbRef.value?.setRectStart(start)
  })
})

onBeforeMount(() => {
  echartInstance?.dispose()
})

const chartThumbRef = ref()
function handleTrumbSelect(start) {
  if (!myIsNumber(start)) return
  echartInstance.dispatchAction({ type: 'dataZoom', start })
}
</script>

<template>
  <div>
    <div class="container">
      <div class="chart-wrap" ref="chartRef"></div>
      <ChartThumb
        ref="chartThumbRef"
        :data="originData"
        @select="handleTrumbSelect"
        :width="200"
        :height="100"
        :rect="40" />
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

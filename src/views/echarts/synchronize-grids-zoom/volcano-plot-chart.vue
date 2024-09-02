<script setup>
import useListenPageResize from '@/use/useListenPageResize'

const props = defineProps({
  data: { type: Array, default: [] },
})

const emit = defineEmits(['zoom'])

const scatterChartRef = ref()
let echartInstance

// 监听页面尺寸变化，重绘图表
const resizeHandler = () => echartInstance?.resize()
useListenPageResize(resizeHandler)

onMounted(() => {
  echartInstance = echarts.init(scatterChartRef.value)
  // datazoom
  echartInstance.on('datazoom', ({ batch = [] } = {}) => {
    if (batch[0] instanceof Object && 'start' in batch[0] && 'end' in batch[0]) {
      const { start, end } = batch[0]
      // console.log('{ start, end }: ', { start, end })
      emit('zoom', { start, end })
    }
  })

  drawChart()
})

onBeforeMount(() => {
  echartInstance?.dispose()
})

const highLightColor = '#ed0508'
function drawChart() {
  const option = {
    grid: { top: 10, left: 60 },
    dataZoom: [
      {
        type: 'inside',
        // filterMode: 'filter',
        // xAxisIndex: [0],
        // startValue: 0,
        // endValue: 20,
        start: 0,
        end: 100,
        // minSpan: 100,
      },
    ],
    dataset: {
      sourceHeader: false,
      // dimensions: [],
      source: props.data,
    },
    tooltip: {
      show: true,
      formatter: ({ data }) => data.tag,
    },
    xAxis: {
      name: 'Log2 fold change',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        color: '#222',
        fontWeight: 'bold',
        fontSize: 18,
      },
      interval: 2,
      min: -4,
      max: 4,
      axisLabel: { fontSize: 16 },
      // splitNumber: 2,
    },
    yAxis: {
      name: '-Log10 adjusted P',
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: {
        color: '#222',
        fontWeight: 'bold',
        fontSize: 18,
      },
      axisLine: { onZero: false },
      axisLabel: { fontSize: 16 },
    },
    series: [
      {
        name: 'multi-compare',
        symbolSize: 5,
        type: 'scatter',
        encode: { x: '_x', y: 'y-axis' },
        itemStyle: {
          color: ({ data }) => (data?.is_highlight ? highLightColor : '#ccc'),
          opacity: 0.6,
        },
        markPoint: {
          data: props.data
            .filter(item => item.is_highlight)
            .map(item => {
              return {
                name: item.tag,
                symbol: 'circle',
                symbolSize: 5,
                coord: [item['_x'] + '', item['y-axis'] + ''],
                itemStyle: { color: highLightColor },
              }
            }),
          label: {
            show: true,
            position: 'top',
            distance: 2,
            formatter: ({ name }) => name ?? '',
            color: highLightColor,
          },
        },
      },
    ],
  }
  echartInstance.setOption(option)
}

function manualZoom({ start, end }) {
  echartInstance.dispatchAction({ type: 'dataZoom', start, end })
}

defineExpose({ manualZoom })
</script>
<template>
  <div ref="scatterChartRef" class="scatter-chart"></div>
</template>
<style lang="scss" scoped>
.scatter-chart {
  height: 500px;
  min-width: 500px;
}
</style>

<script setup>
import useListenPageResize from '@/use/useListenPageResize'
import useMovableBlock from './use-movable-block'
import data from './data.json'

const chartRef = ref()
let echartInstance

// set resize listener
const resizeEcharts = () => {
  echartInstance?.resize()
  ;({ offsetHeight, offsetWidth } = chartRef.value)
} // 图表重绘
useListenPageResize(resizeEcharts)

onMounted(() => {
  ;({ offsetHeight, offsetWidth } = chartRef.value)
  echartInstance = echarts.init(chartRef.value)
  echartInstance.setOption(getOption())
  echartInstance.on('click', 'series.pie', function (params) {
    handleClickPie(params, chartRef)
  })
})
function getOption() {
  const legends = data.map(p => p.item)
  return {
    legend: { data: legends },
    series: [
      {
        name: 'Disease Area and Gene (from TRG) Covered',
        type: 'pie',
        radius: ['0%', '60%'],
        top: Math.ceil(legends.length / 4) * 20 + 'px',
        labelLine: { length: 40, length2: 20 },
        label: {
          formatter: '{name|{b}}\n{per|{d}% ({c})}',
          alignTo: 'labelLine', //'edge',
          minMargin: 5,
          edgeDistance: 10,
          lineHeight: 15,
          rich: {
            per: { fontSize: 10, color: '#999' },
          },
        },
        labelLayout: function (params) {
          const isLeft = params.labelRect.x < echartInstance.getWidth() / 2
          const points = params.labelLinePoints
          // Update the end point.
          points[2][0] = isLeft ? params.labelRect.x : params.labelRect.x + params.labelRect.width
          return { labelLinePoints: points }
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        data,
      },
    ],
  }
}

let offsetHeight, offsetWidth
// 图表点击处理事件
function handleClickPie(params, refEl) {
  const domClass = 'info-' + params.name.replace(/\W+/g, '-')
  let curr = refEl.value.querySelector('.' + domClass)
  // 已存在，控制显隐
  if (curr) {
    curr.style.visibility = curr.style.visibility === 'hidden' ? 'visible' : 'hidden'
    return
  }
  // 创建tags展示框
  const { targetEl } = useMovableBlock('.' + domClass, refEl.value)
  // 设置属性、样式、内容
  targetEl.className = domClass
  targetEl.innerHTML = `${params.data.tags.map(t => t.name).join('\n')}`
  if (params.color) targetEl.style.setProperty('--theme-color', params.color)
  // 初始定位
  const { offsetX, offsetY } = params.event
  const tmpX = (offsetWidth - offsetHeight * 1) / 2
  let left = tmpX * (1 - Math.abs(offsetWidth / 2 - offsetX) / (offsetWidth / 2))
  if (offsetX > offsetWidth / 2) left = offsetWidth - left
  targetEl.style.left = left + 'px'
  targetEl.style.top = offsetY + 'px'
}
</script>
<template>
  <div class="adjust-width">
    <div class="chart-wrap" ref="chartRef"></div>
    <h3>Notes:</h3>
    <ul class="no-marker">
      <li>监听 series.pie 点击事件，控制提示框(vue组件，非echarts官方组件)的定位与显隐</li>
      <li>系列 label 格式化，引导线延长至边缘</li>
    </ul>
  </div>
</template>
<style lang="scss" scoped>
.chart-wrap {
  height: 400px;
  position: relative;
  background-color: #fff;
}
:deep([class*='info-']) {
  --theme-color: #387fe5;
  position: absolute;
  font-size: 12px;
  line-height: 1.25em;
  width: 200px;
  padding: 4px 6px;
  color: var(--theme-color);
  border: 1px solid var(--theme-color);
  border-radius: 4px;
  box-shadow: 0 0 2px 0;
  background-color: #fff;
  transform: translate(-50%, -50%);
  cursor: grab;
}
</style>

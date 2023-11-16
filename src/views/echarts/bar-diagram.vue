<script setup>
import useHandleListenPageSizeChange from '@/use/use-handle-listen-page-size-change'

const chartRef = ref()
let echartInstance

// set resize listener
const resizeEcharts = () => {
  echartInstance?.resize()
} // 图表重绘
useHandleListenPageSizeChange(resizeEcharts)

onMounted(() => {
  echartInstance = echarts.init(chartRef.value)
  echartInstance.setOption({
    title: { show: false },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    toolbox: {
      orient: 'vertical',
      top: 'middle',
      emphasis: { iconStyle: { textPosition: 'left' } },
      feature: {
        dataView: {
          show: true,
          title: 'Data view',
          readOnly: true,
          lang: ['Data View', 'Close', 'Refresh'],
          buttonColor: '#f4f4f5',
          buttonTextColor: '#909399',
          // 生成数据视图的表格
          optionToContent: ({ dataset = [] }) => {
            // 根据数据集生成数据视图
            const { dimensions, source } = dataset[0]
            const theadStr = dimensions.map(a => `<th>${a}</th>`).join('')
            const tbodyStr = source
              .map(s => `<tr>${dimensions.map(a => '<td>' + s[a] + '</td>').join('')}</tr>`)
              .join('')
            return `<table class="data-view-tb" stripe>
                <thead><tr>${theadStr}</tr></thead>
                <tbody>${tbodyStr}</tbody>
              </table>`
          },
        },
        magicType: {
          show: true,
          type: ['line', 'bar'],
          title: { line: 'Switch to line chart', bar: 'Switch to bar chart' },
        },
        saveAsImage: { show: true, title: 'Save as image' },
      },
    },
    legend: {},
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category' },
    yAxis: { type: 'value', min: 0 },
    series: [{ type: 'bar' }, { type: 'bar' }, { type: 'bar' }, { type: 'bar' }],
    // 数据集
    dataset: {
      dimensions: ['month', 'Hold', 'Pending-Review', 'Go', 'No-Go'],
      source: [
        { month: '2022 Nov', Hold: 10, 'Pending-Review': 90, Go: 23, 'No-Go': 9 },
        { month: '2022 Dec', Hold: 11, 'Pending-Review': 90, Go: 23, 'No-Go': 9 },
        { month: '2023 Jan', Hold: 12, 'Pending-Review': 79, Go: 31, 'No-Go': 11 },
        { month: '2023 Feb', Hold: 12, 'Pending-Review': 82, Go: 32, 'No-Go': 11 },
        { month: '2023 Mar', Hold: 12, 'Pending-Review': 82, Go: 32, 'No-Go': 11 },
        { month: '2023 Apr', Hold: 12, 'Pending-Review': 83, Go: 32, 'No-Go': 11 },
        { month: '2023 May', Hold: 12, 'Pending-Review': 83, Go: 32, 'No-Go': 11 },
        { month: '2023 Jun', Hold: 16, 'Pending-Review': 81, Go: 31, 'No-Go': 11 },
        { month: '2023 Jul', Hold: 16, 'Pending-Review': 82, Go: 32, 'No-Go': 11 },
        { month: '2023 Aug', Hold: 16, 'Pending-Review': 82, Go: 32, 'No-Go': 11 },
        { month: '2023 Sep', Hold: 16, 'Pending-Review': 82, Go: 32, 'No-Go': 11 },
        { month: '2023 Nov', Hold: 16, 'Pending-Review': 82, Go: 32, 'No-Go': 11 },
      ],
    },
  })
})
</script>

<template>
  <div>
    <div class="chart-wrap" ref="chartRef"></div>
    <h3>Notes:</h3>
    <ul class="no-marker">
      <li>自定义数据视图</li>
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

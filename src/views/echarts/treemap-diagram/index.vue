<script setup>
import useListenPageResize from '@/use/useListenPageResize'
import data from './data.json'
import { addThousandSeparator, sortByNumAndOrder } from '@/utils/common-methods'

const chartRef = ref()
let echartInstance

// set resize listener
const resizeEcharts = () => {
  echartInstance?.resize()
} // 图表重绘
useListenPageResize(resizeEcharts)

onMounted(() => {
  echartInstance = echarts.init(chartRef.value)
  // draw
  echartInstance.setOption({
    grid: { left: 0, right: 0, bottom: 0, top: 0 },
    tooltip: {
      formatter(info) {
        return `${echarts.format.encodeHTML(
          info.treePathInfo
            .slice(1)
            .map(t => t.name)
            .join(' / ')
        )}<br/>Number: ${echarts.format.addCommas(info.value)}`
      },
    },
    toolbox: {
      feature: {
        dataView: {
          show: true,
          title: 'Data View',
          readOnly: true,
          lang: ['Data View', 'Close', 'Refresh'],
          buttonColor: '#f4f4f5',
          buttonTextColor: '#909399',
          optionToContent: (opt) => {
            const data = opt.series[0].data
            if (!Array.isArray(data)) return ''
            const nodeDataToTreeNode = (d) => {
              const { name, value, children } = d
              const briefName = name.split('.').slice(-1)[0]
              if (Array.isArray(children) && children.length > 0) {
                return `
                  <details open="true">
                    <summary><span><label title="${name}">${briefName}:</label> ${addThousandSeparator(value)}</span></summary>
                    <div>${
                      children
                        .toSorted((a, b) => sortByNumAndOrder(a, b, 'value', 'desc'))
                        .map(item => nodeDataToTreeNode(item))
                        .join('')
                    }</div>
                  </details>`
              } else {
                return `<span><label title="${name}">${briefName}:</label> ${addThousandSeparator(value)}</span>`
              }
            }
            return `<div class="treemap-data-view">${
              data
                .toSorted((a, b) => sortByNumAndOrder(a, b, 'value', 'desc'))
                .map(item => nodeDataToTreeNode(item, 0))
                .join('')
            }</div>`
          }
        },
        restore: { show: true, title: 'restore' },
      },
    },
    series: [
      {
        type: 'treemap',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        leafDepth: 1,
        data: data.children,
        scaleLimit: { min: 1, max: 1.2 },
        label: {
          padding: 1,
          overflow: 'truncate',
          ellipsis: '...',
          formatter: ({ data }) => {
            const { name, value } = data || {}
            return `${name}\n${addThousandSeparator(value)}`
          },
        },
        levels: [
          {
            itemStyle: { borderWidth: 0, gapWidth: 3 },
          },
          {
            itemStyle: { gapWidth: 1 },
          },
          {
            colorSaturation: [0.35, 0.5],
            itemStyle: { gapWidth: 1, borderColorSaturation: 0.6 },
          },
        ],
        breadcrumb: { show: false },
      },
    ],
  })
})
onBeforeUnmount(() => {
  echartInstance?.dispose()
})
</script>

<template>
  <div>
    <div class="chart-wrap" ref="chartRef"></div>
    <h3>Tips:</h3>
    <ul class="no-marker">
      <li>自定义数据视图</li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.chart-wrap {
  position: relative;
  width: 600px;
  height: 500px;
  color: #222;
}
.chart-wrap :deep(.treemap-data-view) {
  display: flex;
  flex-wrap: wrap;
  column-gap: 1em;
  padding: 0 20px;
  line-height: 1.5em;
  label {
    font-weight: bold;
  }
  details {
    width: 100%;
  }
  details>div {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1em;
    padding-left: 1em;
  }
}
.chart-wrap :deep(> div:has(.treemap-data-view)) {
  inset: 0 !important;
  z-index: 9999999;
}
</style>

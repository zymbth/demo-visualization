<script setup>
import useHandleListenPageSizeChange from '@/use/use-handle-listen-page-size-change'
import { mergeObjects, simpleDeepCopy, isArrElementsEqual } from '@/utils/common-methods'
// import { scaleLinear } from 'd3-scale'
import data from './data.json'

// const emit = defineEmits(['brushSelected'])

const chartRef = ref()

let echartInstance

// 是否已将所有散点着色？
// const colorAllSpots = ref(true)

onMounted(() => {
  // 初始化散点图
  echartInstance = echarts.init(chartRef.value)
  // 监听选择框事件
  echartInstance.on('brushSelected', handleBrushSelected)
  echartInstance.on('brushEnd', handleBrushEnd)
  echartInstance.on('brush', handleBrush)
  drawHeatMap()
})

// 图表重绘
function resizeEcharts() {
  echartInstance?.resize()
}
useHandleListenPageSizeChange(resizeEcharts)

/**
 * 散点图 brush 事件
 */
const selected = ref([]) // 选中的散点id列表
const selectDelay = 500
let onBrushing = false // 正在框选中
// 选择框事件处理: 更新记录最新选点
function handleBrushSelected({ batch = [] }) {
  const { dataIndex, seriesName } = batch[0].selected[0] ?? {}
  const isClear = batch[0].areas.length === 0 // brush工具栏-清空选择
  if (!dataIndex || !seriesName) {
    console.error('Failed to get brush selected data', dataIndex, seriesName)
    return
  }
  if (!(data[seriesName] instanceof Array)) {
    console.error('Failed to get series data', seriesName)
    return
  }
  const selectedIds = data[seriesName].reduce((prev, curr, idx) => {
    if (dataIndex.includes(idx)) {
      prev.push(curr.id)
    }
    return prev
  }, [])
  if (isArrElementsEqual(selectedIds, selected.value)) return
  // console.log('selectedIds', selectedIds)
  selected.value = selectedIds
  if (isClear) endBrush()
}
// 框选结束事件处理：调用父组件接口，更新数据
function handleBrushEnd(params) {
  // echarts bruch bug: handleBrushSelected会在延时后触发，handleBrushEnd在框选结束后立即触发
  // 添加相同延时，避免未获取到最新数据
  setTimeout(() => {
    endBrush()
  }, selectDelay)
}
function endBrush() {
  onBrushing = false
  console.log('Selected:', selected.value)
  // emit('brushSelected', selected.value)
}
// 框选中
function handleBrush() {
  // 框选开始时，恢复散点着色
  if (!onBrushing) {
    onBrushing = true
    // 是否需要恢复着色？(着色时忽视数据集中的散点的is_highlight值)
    // if (colorAllSpots.value !== true) colorAllSpots.value = true
  }
}

/**
 * 散点图配置参数及绘制
 */

// 绘制散点图
function drawHeatMap() {
  const option = generateEchartInitialOpts()
  echartInstance.setOption(option)
}

// echarts visualMap 线性渐变色
const legendRange = [0.5, 2, 6]
// const legendColorRange = ['#2d85c5', '#e2e2e2', '#c33726']
const legendColors = [
  'rgb(45, 133, 197)',
  'rgb(105, 164, 207)',
  'rgb(166, 195, 216)',
  'rgb(226, 226, 226)',
  'rgb(222, 205, 203)',
  'rgb(218, 183, 179)',
  'rgb(214, 162, 156)',
  'rgb(211, 141, 132)',
  'rgb(207, 119, 109)',
  'rgb(203, 98, 85)',
  'rgb(199, 76, 62)',
  'rgb(195, 55, 38)',
]
// function mapValueToColor(val) {
//   // 非数字返回透明色
//   if (!myIsNumber(val)) return 'transparent'
//   return scaleLinear().domain(legendRange).range(legendColorRange).clamp(true)(val)
// }
const outOfBrushColor = 'rgba(228,228,228,0.3)'
/**
 * echarts itemStyle.color回调函数: (params: Object) => Color
 * 根据 is_highlight & skip_ratio 值计算散点颜色
 *
 * @param {Object} params color回调函数参数
 * @returns {string} color
 */
// function calcSpotColor({ data }) {
//   if (!colorAllSpots.value && !data.is_highlight) return outOfBrushColor
//   return mapValueToColor(data?.skip_ratio)
// }

const baseGridTitleOpt = { type: 'text', z: 100, style: { fontSize: 16, fontWeight: 'bold' } }
const baseGripOpts = { show: true, height: '38%', width: '29%' }
const getGridTitleOpt = opts => {
  return mergeObjects(simpleDeepCopy(baseGridTitleOpt), opts)
}
// 各表对应的部分echarts配置
const baseOpts = readonly({
  GeneExpression: {
    grid: { ...baseGripOpts, top: '7%', left: '4%' },
    gridTitle: getGridTitleOpt({ left: '13%', top: '4%', style: { text: 'Gene expression' } }),
  },
  Splicing: {
    grid: { ...baseGripOpts, top: '7%', left: '37%' },
    gridTitle: getGridTitleOpt({ left: 'center', top: '4%', style: { text: 'Splicing' } }),
  },
  SplicingKmer: {
    grid: { ...baseGripOpts, top: '7%', left: '70%' },
    gridTitle: getGridTitleOpt({ right: '13%', top: '4%', style: { text: 'Splicing/Kmer' } }),
  },
  ChemicalStructure: {
    grid: { ...baseGripOpts, top: '55%', left: '4%' },
    gridTitle: getGridTitleOpt({ left: '13%', top: '51%', style: { text: 'Chemical structure' } }),
  },
  KANOFeature: {
    grid: { ...baseGripOpts, top: '55%', left: '37%' },
    gridTitle: getGridTitleOpt({ left: 'center', top: '51%', style: { text: 'KANO feature' } }),
  },
  SplicingMotif: {
    grid: { ...baseGripOpts, top: '55%', left: '70%' },
    gridTitle: getGridTitleOpt({ right: '13%', top: '51%', style: { text: 'Splicing/motif' } }),
  },
})

// echarts散点图数据集
const dataset = computed(() => {
  const tmp = Object.keys(baseOpts).map(k => {
    return { id: k, source: data[k] instanceof Array ? data[k] : [] }
  })
  // colorAllSpots.value = !tmp[0].source.some(spot => !spot.is_highlight)
  return tmp
})

/**
 * 生成散点图初始配置信息
 *
 * @see https://echarts.apache.org/zh/option.html#brush.brushLink
 */
function generateEchartInitialOpts() {
  if (typeof data !== 'object') throw new Error('Invalid data')
  let option = {
    // 区域选择组件
    brush: {
      brushLink: 'all',
      xAxisIndex: 'all',
      yAxisIndex: 'all',
      inBrush: { opacity: 1, symbolSize: 7 },
      outOfBrush: { color: outOfBrushColor, symbolSize: 5 },
      throttleType: 'debounce', // 去弹跳，延时触发 brushSelected 事件，brush结束不会立即触发一次
      throttleDelay: selectDelay,
      removeOnClick: false,
    },
    // 散点 tooltip
    tooltip: {
      trigger: 'item',
      formatter: ({ data }) => data.tag,
    },
    // 工具栏
    toolbox: {
      left: 16,
      top: 0,
      itemSize: 20,
      itemGap: 4,
      emphasis: { iconStyle: { color: '#387fe5' } },
      feature: {
        brush: {
          // brush工具title翻译
          title: {
            rect: 'Rectangular\nselection',
            polygon: 'Polygon\nselection',
            keep: 'Keep\nselection',
            clear: 'Clear\nselection',
          },
        },
      },
    },
    // 视觉映射组件，自动映射散点颜色
    visualMap: {
      type: 'continuous',
      min: legendRange[0],
      max: legendRange.at(-1),
      precision: 2,
      top: 0,
      right: 20,
      orient: 'horizontal',
      itemWidth: 16,
      itemHeight: 100,
      text: ['', 'CE/ES ratio'],
      dimension: 'skip_ratio',
      color: legendColors, // 会覆盖series的color
      // 兼容两种着色，使series的color优先级更高 https://echarts.apache.org/zh/option.html#visualMap-continuous.inRange
      // target: {
      //   // 表示 目标系列 的视觉样式。
      //   inRange: {},
      // },
      // controller: {
      //   // 表示 visualMap-continuous 本身的视觉样式。
      //   inRange: {
      //     color: legendColors,
      //   },
      // },
    },
    dataset: dataset.value, // 数据集
    grid: [], // grid列表
    graphic: [], // 额外添加各grid标题
    series: [],
    xAxis: [],
    yAxis: [],
  }
  // 依次添加6个图表对应的配置
  return Object.entries(baseOpts).reduce((prev, [k, v], idx) => {
    prev.grid[idx] = { ...v.grid }
    prev.series[idx] = {
      type: 'scatter',
      name: k,
      colorBy: 'data',
      xAxisIndex: idx,
      yAxisIndex: idx,
      // symbolSize: 5,
      symbolSize: ({ is_highlight }) => (/* !colorAllSpots.value && */ is_highlight ? 7 : 5),
      datasetIndex: idx,
      encode: { x: 'x', y: 'y' },
      // itemStyle: { color: calcSpotColor },
    }
    prev.xAxis[idx] = {
      type: 'value',
      name: 'TSNE-1',
      nameLocation: 'middle',
      nameGap: '20',
      gridIndex: idx,
      scale: true,
      axisLine: { onZero: false },
      splitLine: { show: false },
    }
    prev.yAxis[idx] = {
      type: 'value',
      name: 'TSNE-2',
      nameLocation: 'middle',
      nameGap: '20',
      gridIndex: idx,
      scale: true,
      axisLine: { onZero: false },
      splitLine: { show: false },
    }
    // 图表标题
    if (v.gridTitle) prev.graphic.push({ ...v.gridTitle })
    return prev
  }, option)
}
</script>
<template>
  <div class="chart-outer-wrap">
    <div class="chart-wrap" ref="chartRef"></div>
    <h3>Notes:</h3>
    <ul class="no-marker">
      <li>多网格，可进行区域选择，并在网格间联动</li>
      <li>监听区域选择事件，获取选中的散点列表</li>
    </ul>
  </div>
</template>
<style lang="scss" scoped>
.chart-outer-wrap {
  overflow-x: auto;
}
.chart-wrap {
  min-width: 1000px;
  height: clamp(550px, calc(100vh - 218px), 800px);
}
</style>

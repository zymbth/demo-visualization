<script setup>
import { ref, onMounted } from 'vue'
import useHandleListenPageSizeChange from '@/use/use-handle-listen-page-size-change'
import data from './data.json'

const chartRef = ref()
let echartInstance

// set resize listener
const resizeEcharts = () => {
  echartInstance?.resize()
} // 图表重绘
useHandleListenPageSizeChange(resizeEcharts)

onMounted(() => {
  echartInstance = echarts.init(chartRef.value)
  // draw
  const legend = data.seq_type_data[0].data_list.map(d => d.name) || []
  const xAxisData = data.date_time_data
  const series = legend.map((l, idx) => ({
    name: l,
    type: idx === legend.length - 1 ? 'line' : 'bar',
    data: data.seq_type_data.map(d => {
      let val = d.data_list.find(p => p.name === l).value
      if (idx === legend.length - 1) val = parseFloat(val)
      return val
    }),
  }))

  const hasLine = series.some(p => p.type === 'line')
  const grid = { top: 30, right: 36, bottom: 56, left: '6%' }
  echartInstance.setOption({
    title: { show: false, text: '项目数量统计（按产品分组）（遗传）' },
    color: [
      '#cff89a',
      '#a3ea76',
      '#3ec660',
      '#9ef8f8',
      '#f5cba7',
      '#f4e48f',
      '#f5a5aa',
      '#ee8019',
      '#ef4d1c',
      '#f92952',
    ],
    tooltip: {
      trigger: 'axis',
      padding: 4,
      axisPointer: { type: 'cross' },
      textStyle: { fontSize: 10 },
      position: function (point, params, dom, rect, size) {
        const [x, y] = point
        const {
          contentSize: [cw, ch],
          viewSize: [vw, vh],
        } = size
        const px = x + cw > vw ? x - cw : x
        const py =
          ch < vh
            ? Math.max(0, y - ch)
            : Math.round(((y - grid.top) * (vh - ch)) / (vh - grid.top - grid.bottom))
        // y: [36, vh-56]
        // map to
        // py: [0, vh-ch]
        // calc: (y-36)/(vh-56-36) = py/(vh-ch) => py = (y-36)*(vh-ch)/(vh-92)
        return [px, py]
      },
    },
    grid, // 图表位置
    toolbox: {
      // 工具栏
      orient: 'vertical',
      top: 'middle',
      feature: {
        // 数据示图
        dataView: {
          show: true,
          // title: '数据视图',
          readOnly: true,
          buttonColor: '#35c4f0',
          buttonTextColor: '#ffffff',
          optionToContent: function (opt) {
            let theads, tbodys
            if (opt.xAxis[0]?.data) {
              let axisData = opt.xAxis[0]?.data
              let series = opt.series
              theads = [opt.xAxis[0].name, ...series.map(s => s.name)]
              tbodys = axisData.map((a, idx) => {
                return [a, ...series.map(s => s.data[idx])]
              })
            } else {
              let axisData = opt.dataset[0].dimensions
              let source = opt.dataset[0].source
              theads = [opt.xAxis[0].name, ...axisData.slice(1)]
              tbodys = source.map(s => {
                return axisData.map(a => s[a])
              })
            }
            return `
              <table class="simple-table" stripe>
                <thead><tr>${theads.map(t => `<th>${t}</th>`).join('')}</tr></thead>
                <tbody>
                  ${tbodys
                    .map(tr => `<tr>${tr.map(td => `<td>${td}</td>`).join('')}</tr>`)
                    .join('')}
                </tbody>
              </table>`
          },
        },
        // dataZoom: { show: true, yAxisIndex: false },
        magicType: { show: true, type: ['line', 'bar'] }, // 切换折线图/柱状图
        restore: { show: false }, // 还原
        saveAsImage: { show: true }, // 保存为图片
      },
    },
    dataZoom: [{ type: 'inside', disabled: xAxisData.length <= 6 }],
    legend: {
      bottom: -5,
      data: legend,
      type: 'scroll',
      animationDurationUpdate: 300, // 图例翻页时的动画时长
      itemGap: 5, // 图例每项之间的间隔
      itemWidth: 15, // 图例标记的图形宽度
      itemHeight: 9, // 图例标记的图形高度
      textStyle: { fontSize: 10, lineHeight: 10, padding: [0, 0, 0, -3] }, // 图例的公用文本样式
    },
    xAxis: [
      {
        type: 'category',
        name: '项目提交时间', // 坐标轴名称
        nameTextStyle: {
          // 坐标轴名称的文字样式
          fontSize: 10,
          align: 'center',
        },
        nameGap: 10, // 坐标轴名称与轴线之间的距离
        nameRotate: -90, // 坐标轴名字旋转，角度值
        data: xAxisData,
        axisTick: {
          // 坐标轴刻度相关设置
          alignWithLabel: true, // 刻度线和标签对齐
          interval: 0, // 显示间隔，auto: 不重叠显示, 0: 重叠, >=1: 间隔显示
        },
        axisLabel: {
          // 坐标轴刻度标签的相关设置
          interval: 'auto', // 显示间隔，auto: 不重叠显示, 0: 重叠, >=1: 间隔显示
          rotate: 15, // 刻度标签旋转的角度 [-90, 90]
          fontSize: 8,
        },
        axisPointer: { type: 'shadow' }, // 坐标轴指示器配置项
      },
    ],
    yAxis: (hasLine => {
      let res = [
        {
          type: 'value',
          name: '数量',
          min: 0,
          minInterval: 1, // max: 600,
          position: 'left',
          splitLine: { show: !hasLine },
          axisLine: { show: false },
        },
      ]
      if (hasLine)
        res.push({
          type: 'value',
          name: '占比',
          min: 0,
          max: 100,
          interval: 20,
          position: 'right',
          axisLine: { show: false },
          axisLabel: { formatter: '{value} %' },
        })
      return res
    })(hasLine),
    series,
  })
})
</script>

<template>
  <div>
    <div class="chart-wrap" ref="chartRef"></div>
    <h3>Notes:</h3>
    <ul class="no-marker">
      <li>自定义数据视图</li>
      <li>折柱图，结合两种可视化方式，在同一坐标系内展现多个系列</li>
      <li>自定义提示框组件定位</li>
      <li>根据数据量激活 echarts 内置型数据区域缩放</li>
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

<script setup>
import data from './data.json'
import ScatterChart from './volcano-plot-chart.vue'

const comparisonList = ref([])
onMounted(() => {
  comparisonList.value = data ?? []
})

const scatterChartRef = ref()
// zoom监听，同步缩放其它图表
function handleZoom(idx, { start, end } = {}) {
  if ((!start && start !== 0) || (!end && end !== 0)) return
  scatterChartRef.value?.forEach((c, index) => {
    if (index === idx) return
    c.manualZoom({ start, end })
  })
}
</script>

<template>
  <div>
    <!-- Scatter Chart -->
    <div class="comparison-grid">
      <div v-for="(item, idx) in comparisonList" :key="item.name" class="grid-wrap">
        <p>{{ item.name }}</p>
        <ScatterChart
          ref="scatterChartRef"
          :data="item.chart"
          @zoom="(...args) => handleZoom(idx, ...args)" />
      </div>
    </div>
    <h3>Tips:</h3>
    <ul class="no-marker">
      <li>多个 Echarts 实例间同步缩放状态及位置</li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  overflow: auto;
  .grid-wrap {
    flex-shrink: 0;
    width: 33%;
    min-width: 520px;

    > p {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
      white-space: nowrap;
    }
  }
}
:deep(.comparison-grid .scatter-chart) {
  height: 400px;
  width: 100%;
  min-width: 400px;
}
</style>

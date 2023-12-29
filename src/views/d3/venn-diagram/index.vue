<script setup>
// import { VennDiagram, sortAreas } from 'venn.js'
import data from './data.json'

onMounted(() => {
  drawChart()
})

function drawChart() {
  const sets = tranformData()

  var chart = venn.VennDiagram().width(400).height(400)

  var div = d3.select('#venn')
  div.datum(sets).call(chart)

  div.selectAll('path').style('stroke-opacity', 0).style('stroke', '#fff').style('stroke-width', 3)

  div
    .selectAll('g')
    .on('mouseover', function (event, d) {
      // sort all the areas relative to the current item
      venn.sortAreas(div, d)

      // Display a tooltip with the current size
      tooltipInfos.visible = true
      tooltipInfos.labels = d.label ? [d.label] : d.labels
      tooltipInfos.size = d.size

      // highlight the current path
      var selection = d3.select(this).transition('tooltip').duration(400)
      selection
        .select('path')
        .style('fill-opacity', d.sets.length == 1 ? 0.4 : 0.1)
        .style('stroke-opacity', 1)
    })

    .on('mousemove', function (event, d) {
      tooltipInfos.left = event.layerX + 14 + 'px'
      tooltipInfos.top = event.layerY + 14 + 'px'
    })

    .on('mouseout', function (event, d) {
      // tooltip.transition().duration(400).style('opacity', 0)
      tooltipInfos.visible = false
      var selection = d3.select(this).transition('tooltip').duration(400)
      selection
        .select('path')
        .style('fill-opacity', d.sets.length == 1 ? 0.25 : 0.0)
        .style('stroke-opacity', 0)
    })
}

const assayTypeMap = {
  'RNA-seq': 0,
  qPCR: 1,
  Minigene: 2,
}
// ∩ &cap; \u2229
function tranformData() {
  let sets = []
  Object.entries(data.chart).forEach(([label, size]) => {
    if (label === 'all') {
      sets.push({ sets: [0, 1, 2], size, labels: Object.keys(assayTypeMap) })
      return
    }
    let labels = label.split('_')
    if (labels.length === 1) {
      sets.push({ sets: [assayTypeMap[label]], label, size })
    } else if (labels.length === 2) {
      sets.push({
        sets: labels.map(l => assayTypeMap[l]) /* , label */,
        labels,
        size,
      })
    }
  })
  const realSizes = sets.map((s, idx) => {
    const subSets = sets.filter((s1, idx1) => {
      if (idx1 === idx || s1.sets.length <= s.sets.length) return false
      return s.sets.every(p => {
        const tmp = s1.sets.find(p1 => p === p1)
        return tmp || tmp === 0
      })
    })
    return subSets.reduce((p, c) => p + c.size, s.size)
  })
  sets.forEach((s, idx) => (s.size = realSizes[idx]))
  return sets
}

const tooltipInfos = reactive({
  visible: false,
  labels: [],
  size: null,
  left: 0,
  top: 0,
})
function generateTooltipTxt() {
  return tooltipInfos.labels.join(' &#8898; ') + ': ' + (tooltipInfos.size ?? '')
}
</script>
<template>
  <div id="venn-container">
    <h4>Compound Quantity Across Assay Types</h4>
    <div id="venn"></div>
    <div
      class="venntooltip"
      :style="{
        left: tooltipInfos.left,
        top: tooltipInfos.top,
        opacity: tooltipInfos.visible ? 0.9 : 0,
      }"
      v-html="generateTooltipTxt()" />
  </div>
</template>
<style lang="scss" scoped>
#venn-container {
  position: relative;
}
.venntooltip {
  position: absolute;
  text-align: center;
  max-width: 180px;
  color: #222;
  padding: 4px;
  background: #fff;
  opacity: 0;
  border-radius: 4px;
  box-shadow: 0 0 4px 2px rgba(0, 0, 0, 0.1);
  transform: translateY(-50%);
  transition: opacity 0.4s;
}
#venn:deep svg {
  overflow: visible;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import D3ScatterDiagram from './d3-scatter'
import data from './data.json'

const tableData = ref([])
const currSpot = ref({})

onMounted(() => {
  const { drawSvg } = new D3ScatterDiagram({
    data,
    domId: 'diagram-wrap',
    cbHoverSpot,
    cbBlurSpot,
    cbBrushEnd,
  })
  drawSvg()
})

function cbHoverSpot({ smiles, id }) {
  currSpot.value = { smiles, id }
}
function cbBlurSpot() {
  currSpot.value = {}
}

function cbBrushEnd(value) {
  tableData.value = value ?? [].filter(t => t.id || t.id === 0)
}
</script>
<template>
  <div>
    <div id="diagram-wrap"></div>
    <p>Focus: {{ currSpot }}</p>
    <p>Selected: {{ tableData.length }}</p>
    <table class="data-view-tb">
      <thead>
        <tr>
          <th>ID</th>
          <th>SMILES</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in tableData" :key="t.id">
          <td>{{ t.id }}</td>
          <td>{{ t.smiles }}</td>
        </tr>
      </tbody>
    </table>
    <h3>Notes:</h3>
    <ul class="no-marker">
      <li>散点图，添加了移动、缩放、区域选择、hover功能</li>
    </ul>
  </div>
</template>
<style>
#diagram-wrap {
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 5px;
  position: relative;
}
</style>

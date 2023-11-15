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
    cbShowSmiles,
    cbHideSmiles,
    cbSelect,
  })
  drawSvg()
})

function cbShowSmiles({ smiles, id }) {
  currSpot.value = { smiles, id }
}
function cbHideSmiles() {
  currSpot.value = {}
}

function cbSelect(value) {
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

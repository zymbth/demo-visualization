<script setup>
import data from './data.json'

const svgWidth = 800,
  svgHeight = 600

// 关系图 links
const links = data.relations.map(d =>
  Object.create({
    source: d[0],
    target: d[1],
    value: 1,
  })
)
// 关系图 nodes
const nodes = data.nodes.map(d =>
  Object.create({
    id: d.smiles,
    group: { search: 1, result: 2 }[d.type],
  })
)

const schemeCategory = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf',
]
const scale = d3.scaleOrdinal(schemeCategory)

onMounted(() => {
  drawDiagram()
})

const drawDiagram = () => {
  let curTransform = { x: 0, y: 0, k: 1 }

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      'link',
      d3.forceLink(links).id(d => d.id)
    )
    .force('charge', d3.forceManyBody().strength(-5).distanceMax(350))
    .force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2))

  const svg = d3
    .select('#svg-container')
    .append('svg')
    // .attr("viewBox", [0, 0, svgWidth, svgHeight]);
    .attr('width', svgWidth)
    .attr('height', svgHeight)

  const linkGroup = svg.append('g')
  const link = linkGroup
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke-width', d => Math.sqrt(d.value) / curTransform.k)
  const nodeGroup = svg.append('g')
  const node = nodeGroup
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5 / curTransform.k)
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', 5 / curTransform.k)
    .attr('fill', d => scale(d.group))
    .call(drag(simulation))

  // node.append("title").text(d => d.id);

  node.on('mouseenter', onMouseEnter).on('mouseleave', onMouseLeave)

  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)

    node.attr('cx', d => d.x).attr('cy', d => d.y)
  })

  // invalidation.then(() => simulation.stop());
  const zoom = d3.zoom()
  svg.call(zoom.on('zoom', zoomed))
  // // svg.call(zoom).on('dblclick.zoom,null)
  function zoomed({ transform, sourceEvent }) {
    const scaleChanged = curTransform.k !== transform.k
    curTransform = transform
    nodeGroup.attr('transform', transform)
    linkGroup.attr('transform', transform)

    if (scaleChanged) {
      nodeGroup
        .selectAll('circle')
        .attr('stroke-width', 1.5 / curTransform.k)
        .attr('r', 5 / curTransform.k)
      linkGroup.selectAll('line').attr('stroke-width', d => Math.sqrt(d.value) / curTransform.k)
    }

    preventAndStop(sourceEvent)
  }
  function preventAndStop(sourceEvent) {
    sourceEvent?.stopPropagation()
    sourceEvent?.preventDefault()
  }
  return svg.node()
}

let drag = simulation => {
  function dragstarted(event, d) {
    if (!d.active) simulation.alphaTarget(0.1).restart()
    d.fx = d.x
    d.fy = d.y
  }

  function dragged(event, d) {
    d.fx = event.x
    d.fy = event.y
  }

  function dragended(event, d) {
    if (!d.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
  }

  return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended)
}

/**
 * popover 弹框
 */
const popWrapWidth = 200,
  popWrapHeight = 100
const currNodeInfo = reactive({})
const popoverStyle = reactive({
  '--limit-width': popWrapWidth + 'px',
  '--limit-height': popWrapHeight + 'px',
  top: 0,
  transform: 'translate(-50%, -100%)',
  visibility: 'hidden',
})

// hover 显示 popover
function onMouseEnter(datum, originData) {
  if (!originData.id) return
  currNodeInfo.index = originData.index
  currNodeInfo.id = originData.id
  currNodeInfo.group = originData.group
  // popover 定位
  let { layerX, layerY } = datum
  // 横向调整
  if (layerX < popWrapWidth / 2) layerX = popWrapWidth / 2
  else if (svgWidth && layerX > svgWidth - popWrapWidth / 2) layerX = svgWidth - popWrapWidth / 2
  // 纵向调整
  if (layerY < popWrapHeight + 20) {
    layerY += 10
    popoverStyle.transform = 'translate(-50%, 0)'
  } else {
    layerY -= 10
    popoverStyle.transform = 'translate(-50%, -100%)'
  }
  // 内容
  popoverStyle.top = layerY + 'px'
  popoverStyle.left = layerX + 'px'
  popoverStyle.visibility = 'visible'
}
// blur 隐藏 popover
function onMouseLeave(datum, index) {
  popoverStyle.visibility = 'hidden'
}
</script>

<template>
  <div class="rs-diagram-container">
    <div class="rs-svg-wrap">
      <div id="svg-container"></div>
    </div>
    <div id="popover-wrap" :style="popoverStyle">
      <div>
        <label>Index: </label>
        <span>{{ currNodeInfo.index }}</span>
      </div>
      <div>
        <label>ID: </label>
        <span>{{ currNodeInfo.id }}</span>
      </div>
      <div>
        <label>Group: </label>
        <span>{{ currNodeInfo.group }}</span>
      </div>
    </div>
    <h3>Notes:</h3>
    <ul class="no-marker">
      <li>自定义 hover 弹框</li>
    </ul>
  </div>
</template>
<style lang="scss" scoped>
.rs-diagram-container {
  position: relative;
  .rs-svg-wrap {
    overflow: hidden;
  }
}
:deep(#svg-container svg) {
  border: 1px solid #ccc;
  border-radius: 4px;
}
#popover-wrap {
  // visibility: hidden;
  position: absolute;
  font-size: 12px;
  width: var(--limit-width, 200px);
  max-height: calc(var(--limit-height, 100px) + 40px);
  padding: 4px 6px;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 0 4px 2px #00000033;
  background-color: #fff;
  word-break: break-all;
  z-index: 2;
  transition: visibility 0.25s;
  &:hover {
    visibility: visible !important;
  }
  label {
    font-weight: bold;
  }
}
</style>

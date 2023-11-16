// import * as d3 from 'd3'

/**
 * 创建一个散点图
 * @param {Object} anonymous { data: 点列表, domId: svg id, config: 其它配置 }
 */
export default function ({
  data = [],
  domId,
  config = {},
  cbHoverSpot,
  cbBlurSpot,
  cbBrushEnd,
} = {}) {
  if (!data instanceof Array) {
    throw new Error('Invalid scatter data')
  }
  let activeColor = '#1c9e77'
  const dimensions = {
    width: config?.width ?? 600,
    height: config?.height ?? 400,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  }
  let xRange = [], yRange = []
  ;({ xRange, yRange } = getCurAriasRange())

  const svg = d3.select('#' + domId)
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height)

  let x = d3.scaleLinear()
    .domain(xRange)
    .nice()
    .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])

  let y = d3.scaleLinear()
    .domain(yRange)
    .nice()
    .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top])

  let init = false,
    brushView, // brush视图
    bounds, // 散点视图
    dots,
    curTransform = { x: 0, y: 0, k: 1 },
    zoomInst // Zoom

  let drawSvg = function (curData) {
    if (curData instanceof Array) {
      data = curData
    }
    init ? updSvg() : initSvg()
  }

  let updSvgSize = function ({ width, height }) {
    if (width) svg?.attr('width', width)
    if (height) svg?.attr('height', height)
  }

  function initSvg() {
    if (init) return
    init = true

    brushView = svg.append('g').style('width', '100%').style('height', '100%')
    const brushInst = d3.brush() // 创建一个新的二维刷取交互
    brushInst.on('start brush end', brushedHandler)
    brushInst.on('end', brushEndedHandler)
    brushView.call(brushInst)

    bounds = svg.append('g')

    zoomInst = d3.zoom()
    svg.call(zoomInst.on('zoom', zoomed))
    if (data?.length) drawDots()
  }

  function updSvg() {
    ;({ xRange, yRange } = getCurAriasRange())
    // dots && dots.remove()
    // drawDots()
    dots
      .data(data)
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))
  }

  function getCurAriasRange() {
    return {
      xRange: d3.extent(data.map(d => d.x).concat(xRange ?? [])),
      yRange: d3.extent(data.map(d => d.y).concat(yRange ?? [])),
    }
  }

  function drawDots() {
    dots = bounds
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))
      .attr('r', 3 / curTransform.k)
      .style('fill', activeColor)
    // console.log('dots size:', dots.size(), data.length)
    dots.on('mouseenter', onMouseEnter).on('mouseleave', onMouseLeave)
  }

  function onMouseEnter(datum, originData) {
    const dayDot = bounds
      .append('circle')
      .attr('class', 'tooltipDot')
      .attr('cx', d => x(originData.x))
      .attr('cy', d => y(originData.y))
      .attr('r', 5 / curTransform.k)
      .style('fill', activeColor)
      .style('pointer-events', 'none')

    cbHoverSpot?.({ smiles: originData.smiles, id: originData.id, datum })
  }
  function onMouseLeave(datum, index) {
    d3.selectAll('.tooltipDot').remove()
    cbBlurSpot?.()
  }

  function brushedHandler({ selection, sourceEvent, endFlag }) {
    let value = []
    if (selection) {
      const [[x0, y0], [x1, y1]] = selection

      value = dots
        .style('fill', 'gray')
        .filter(
          d =>
            x0 <= transX(x(d.x)) &&
            transX(x(d.x)) < x1 &&
            y0 <= transY(y(d.y)) &&
            transY(y(d.y)) < y1
        )
        .style('fill', activeColor)
        .data()
    } else {
      dots.style('fill', activeColor)
    }
    endFlag && cbBrushEnd(value)
    svg.property('value', value).dispatch('input')
    preventAndStop(sourceEvent)
  }
  function brushEndedHandler({ selection, sourceEvent }) {
    brushedHandler({ selection, sourceEvent, endFlag: true })
  }

  function transX(val) {
    return val * curTransform.k + curTransform.x
  }
  function transY(val) {
    return val * curTransform.k + curTransform.y
  }
  function zoomed({ transform, sourceEvent }) {
    curTransform = transform
    // svg.attr('transform, transform)
    // brushView.attr('transform', transform)
    bounds.attr('transform', transform)
    bounds.selectAll('circle').attr('r', 3 / curTransform.k)

    preventAndStop(sourceEvent)
  }

  function preventAndStop(sourceEvent) {
    sourceEvent?.stopPropagation()
    sourceEvent?.preventDefault()
  }

  return {
    data,
    activeColor,
    drawSvg,
    updSvgSize,
  }
}

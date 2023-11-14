import { generateUUID, myIsNumber, myTypeof } from '@/utils/common-methods'
// import { Buffer } from 'buffer'

/**
 * @param {string|Element} val css选择器或元素
 * @param {string} [filename] 文件名
 * @param {Object} [configs] { imageType, quality }
 * @param {string} [configs.imageType] 导出图片MIME类型，['image/png'|'image/jpeg'|'image/gif'|'image/bmp'|'image/webp']
 * @param {number} [configs.quality] 图片质量
 * @example
 * import exportSvgToPng from '@/utils/export-svg-to-png'
 *
 * exportSvgToPng('.heatmap-chart svg', '', { imageType: 'image/jpeg' })
 */
export default (val, filename, { imageType, quality, fillStyle = 'white' } = {}) => {
  let svgEl
  switch (myTypeof(val)) {
    case 'string':
      svgEl = document.querySelector(val)
      break
    case 'element':
      svgEl = val
      break
    default:
      throw new Error('Failed to download svg as png, please input css selector or certain element')
  }
  if (!['image/png', 'image/jpeg', 'image/gif', 'image/bmp', 'image/webp'].includes(imageType))
    imageType = 'image/png'
  let imageQuality = 0.92
  if (myIsNumber(quality) && quality > 0 && quality <= 1) imageQuality = Number(quality)

  const svgData = new XMLSerializer().serializeToString(svgEl)
  const svgDataBase64 = btoa(unescape(encodeURIComponent(svgData)))
  // const svgDataBase64 = Buffer.from(svgData, 'utf-8').toString('base64')

  const svgDataUrl = `data:image/svg+xml;charset=utf-8;base64,${svgDataBase64}`

  const img = new Image()
  img.src = svgDataUrl
  img.onload = function () {
    const width = svgEl.getAttribute('width')
    const height = svgEl.getAttribute('height')
    const canvas = document.createElement('canvas')
    canvas.setAttribute('width', width)
    canvas.setAttribute('height', height)

    const context = canvas.getContext('2d')
    if (imageType !== 'image/png' && fillStyle) {
      context.fillStyle = fillStyle
      context.fillRect(0, 0, width, height) // 填充整个画布
    }
    context.drawImage(img, 0, 0, width, height)

    var aLink = document.createElement('a')
    aLink.style.display = 'none'
    // aLink.href = canvas.toDataURL('image/png', 1.0)
    aLink.href = canvas.toDataURL(imageType, imageQuality)
    aLink.download = filename ? String(filename) : generateUUID()
    document.body.appendChild(aLink)
    aLink.click()
    document.body.removeChild(aLink)
  }
}

var count = 0

/**
 * Returns a new unique identifier
 *
 * @see https://github.com/observablehq/stdlib/blob/main/README.md#DOM_uid
 * @see https://github.com/observablehq/stdlib/blob/main/src/dom/uid.js
 * @example
 * import { uid } from '@/utils/uid'
 * const clip = uid('heatmap-clipper')
 * // usage:
 * `<clipPath id="${clip.id}">...</clipPath>`
 * `<g>clip-path="${clip}"</g>`
 */
export function uid(name) {
  return new Id('O-' + (name == null ? '' : name + '-') + ++count)
}

function Id(id) {
  this.id = id
  this.href = new URL(`#${id}`, location) + ''
}

Id.prototype.toString = function () {
  return 'url(' + this.href + ')'
}

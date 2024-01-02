// typeof link: https://juejin.cn/post/7000300249235357709#heading-3
export function myTypeof(data) {
  return data instanceof Element
    ? 'element'
    : Object.prototype.toString
        .call(data)
        .replace(/\[object\s(.+)\]/, '$1')
        .toLowerCase()
}

/**
 * 是否是数字（或字符串数字）
 * @param {*} val
 * @returns {boolean}
 */
export function myIsNumber(val) {
  // return !isNaN(val) && val !== true && (val || val === 0)
  // return !isNaN(val) && /^\s*\d+(.\d+)?\s*$/.test(val)
  if (isNaN(val) || val === true) return false
  if (!val && val !== 0) return false
  if (String(val).trim().length === 0) return false
  return true
}

/**
 * 生成UUID类型随机字符串
 *
 * 格式：xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * x表示任意十六进制数字，y表示(8, 9, A, 或 B)这四个十六进制数字之一
 * 根据 UUID 规范，第 13 位必须是固定的数字 4，而第 17 位必须是 8、9、A 或 B 中的一个
 * @returns {string}
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    // r                : 随机数 0-15
    // "r & 0x3"        : 只保留 r 后两位，[0000,0011]
    // "(r & 0x3) | 0x8": 第四位设置为 1，[1000,1011]
    let r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 去弹跳，会在一个延时后执行 fn 函数
 *
 * @param {Function} fn 实际要执行的函数
 * @param {Number} delay 延迟时间，也就是阈值，单位是毫秒（ms）
 * @param {Object} _this this
 * @returns {Function} 返回一个“去弹跳”了的函数
 */
export function debounce(fn, delay = 200, _this) {
  var timer

  return function () {
    // 保存函数调用时的上下文和参数，传递给 fn
    var context = _this
    var args = arguments

    // 每次这个返回的函数被调用，就清除定时器，以保证不执行 fn
    clearTimeout(timer)

    // 当返回的函数被最后一次调用后（也就是用户停止了某个连续的操作），
    // 再过 delay 毫秒就执行 fn
    timer = setTimeout(function () {
      context ? fn.apply(context, args) : fn(...args)
    }, delay)
  }
}

/**
 * 节流，指定时间间隔内，最多执行一次
 *
 * @param {Function} fn 实际要执行的函数
 * @param {Number} threshhold 执行间隔，单位是毫秒（ms）
 * @param {Object} _this this
 * @returns
 */
export function throttle(fn, threshhold = 250, _this) {
  let last // 记录上次执行的时间
  let timer

  // 返回的函数，每过 threshhold 毫秒就执行一次 fn 函数
  return function () {
    // 保存函数调用时的上下文和参数，传递给 fn
    let context = _this
    let args = arguments
    let now = +new Date()

    // 如果距离上次执行 fn 函数的时间小于 threshhold，那么就放弃
    // 执行 fn，并重新计时
    if (last && now < last + threshhold) {
      clearTimeout(timer)

      // 保证在当前时间区间结束后，再执行一次 fn
      timer = setTimeout(function () {
        last = now
        context ? fn.apply(context, args) : fn(...args)
      }, threshhold)
    } else {
      last = now
      context ? fn.apply(context, args) : fn(...args)
    }
  }
}

// 简单的对象深拷贝
export function simpleDeepCopy(obj) {
  return obj && JSON.parse(JSON.stringify(obj))
}

/**
 * 将对象additionObj合并到目标对象targetObj上
 * 合并：对于additionObj中的所有根属性值，将它复制并覆盖在targetObj同样层级中，如果不存在就在targetObj中创建该层级并复制。
 * 例如：targetObj = { k: 'v', o: { oo: 'vv' } }, additionObj = { k1: 'v1', o: { oo: 'vv1' } }
 * 合并后的targetObj为 { k: 'v', k1: 'v1', o: { oo: 'vv1' } }
 *
 * @param {Object} targetObj 目标对象
 * @param {Object} additionObj 待合并对象
 * @example
 * let targetObj = { k: 'v', o: { oo: 'vv' } }
 * let additionObj = { k1: 'v1', o: { oo: 'vv1' } }
 * mergeObjects(targetObj, additionObj)
 * console.log(targetObj) // { k: 'v', k1: 'v1', o: { oo: 'vv1' } }
 */
export function mergeObjects(targetObj, additionObj) {
  for (let key in additionObj) {
    if (typeof additionObj[key] === 'object' && typeof targetObj[key] === 'object') {
      mergeObjects(targetObj[key], additionObj[key])
    } else {
      targetObj[key] = additionObj[key]
    }
  }
  return targetObj
}

// 数组元素是否相等
export function isArrElementsEqual(arr1, arr2) {
  if (!(arr1 instanceof Array) || !(arr2 instanceof Array) || arr1.length !== arr2.length)
    return false
  return arr1.every(p1 => arr2.find(p2 => p1 === p2))
}

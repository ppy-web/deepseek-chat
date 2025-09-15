export default {
  /**
   * 字符串
   * @param {*} arg
   * @returns {Boolean}
   */
  isString (str) {
    if (typeof str === 'string' || str instanceof String) {
      return true
    }
    return false
  },
  /**
   * 数组
   * @param {*} arg
   * @returns {Boolean}
   */
  isArray (arg) {
    if (typeof Array.isArray === 'undefined') {
      return Object.prototype.toString.call(arg) === '[object Array]'
    }
    return Array.isArray(arg)
  },
  /**
   * 移动端设备
   * @returns {Boolean}
   */
  isMobileDevice () {
    const Regex =
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    if (window.navigator.userAgent.match(Regex)) {
      return true
    }
    return false
  },
  /**
   * 手机号
   * @param {String}
   * @returns {Boolean}
   */
  isMobile (str) {
    return /^1[3456789]\d{9}$/.test(str)
  },
  /**
   * URL
   * @param {String} str
   * @returns {Boolean}
   */
  isURL (str) {
    const reg =
      /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
    return reg.test(str)
  },
  /**
   * 中文
   * @param {String} str
   * @returns {Boolean}
   */
  isChinese (str) {
    const reg = /^[\u4E00-\u9FA5]+$/
    return reg.test(str)
  },
  /**
   * 英文
   * @param {String} str
   * @returns {Boolean}
   */
  isAlphabets (str) {
    const reg = /^[A-Za-z]+$/
    return reg.test(str)
  },
  /**
   * 小写字母
   * @param {String} str
   * @returns {Boolean}
   */
  isLowerCase (str) {
    const reg = /^[a-z]+$/
    return reg.test(str)
  },
  /**
   * 大写字母
   * @param {String} str
   * @returns {Boolean}
   */
  isUpperCase (str) {
    const reg = /^[A-Z]+$/
    return reg.test(str)
  },
  /**
   * 特殊字符
   * @param {String} str
   * @returns {Boolean}
   */

  /**
   * 复杂密码（大写、小写、数字、特殊字符四种最低包含三种）
   * @param {String} str
   * @returns {Boolean}
   */
  isPassword (str) {
    // 包含中文
    if (/[\u4e00-\u9fa5]/gm.test(str)) return false

    const regStr = {
      l: '(?=.*[a-z])',
      u: '(?=.*[A-Z])',
      n: '(?=.*[0-9])',
      s: '(?=.*[^A-Za-z0-9])'
    }
    const regArr = [
      // 小写、大写、数字
      regStr.l + regStr.u + regStr.n,
      // 小写、大写、特殊字符
      regStr.l + regStr.u + regStr.s,
      // 小写、数字、特殊字符
      regStr.l + regStr.n + regStr.s,
      // 大写、数字、特殊字符
      regStr.u + regStr.n + regStr.s,
      // 小写、大写、数字、特殊字符
      regStr.l + regStr.u + regStr.n + regStr.s
    ]
    let result = false
    for (let i = 0; i < regArr.length; i++) {
      if (new RegExp(regArr[i]).test(str)) {
        result = true
        break
      }
    }
    return result
  }
}

/**
 * 验证工具类
 */
const validator = {
  /**
   * 字符串
   */
  isString(str: unknown): str is string {
    return typeof str === 'string' || str instanceof String;
  },

  /**
   * 数组
   */
  isArray(arg: unknown): arg is unknown[] {
    return Array.isArray(arg);
  },

  /**
   * 移动端设备
   */
  isMobileDevice(): boolean {
    const Regex =
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i;
    return !!window.navigator.userAgent.match(Regex);
  },

  /**
   * 手机号
   */
  isMobile(str: string): boolean {
    return /^1[3456789]\d{9}$/.test(str);
  },

  /**
   * URL
   */
  isURL(str: string): boolean {
    const reg =
      /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    return reg.test(str);
  },

  /**
   * 中文
   */
  isChinese(str: string): boolean {
    return /^[\u4E00-\u9FA5]+$/.test(str);
  },

  /**
   * 英文
   */
  isAlphabets(str: string): boolean {
    return /^[A-Za-z]+$/.test(str);
  },

  /**
   * 小写字母
   */
  isLowerCase(str: string): boolean {
    return /^[a-z]+$/.test(str);
  },

  /**
   * 大写字母
   */
  isUpperCase(str: string): boolean {
    return /^[A-Z]+$/.test(str);
  },

  /**
   * 复杂密码（大写、小写、数字、特殊字符四种最低包含三种）
   */
  isPassword(str: string): boolean {
    if (/[\u4e00-\u9fa5]/gm.test(str)) return false;

    const regStr = {
      l: '(?=.*[a-z])',
      u: '(?=.*[A-Z])',
      n: '(?=.*[0-9])',
      s: '(?=.*[^A-Za-z0-9])',
    };
    const regArr = [
      regStr.l + regStr.u + regStr.n,
      regStr.l + regStr.u + regStr.s,
      regStr.l + regStr.n + regStr.s,
      regStr.u + regStr.n + regStr.s,
      regStr.l + regStr.u + regStr.n + regStr.s,
    ];
    let result = false;
    for (let i = 0; i < regArr.length; i++) {
      if (new RegExp(regArr[i]).test(str)) {
        result = true;
        break;
      }
    }
    return result;
  },
};

export default validator;

/**
 * 本地存储工具类
 * 基于 localStorage 实现，支持过期时间
 */
const storage = {
  /** 后缀标识 */
  suffix: "_deadtime",

  /**
   * 获取
   * @param key 关键字
   */
  get(key: string): string | null {
    return localStorage.getItem(key);
  },

  /**
   * 获取全部
   */
  info(): Record<string, string | null> {
    const d: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        d[key] = localStorage.getItem(key);
      }
    }
    return d;
  },

  /**
   * 设置
   * @param key 关键字
   * @param value 值
   * @param expires 过期时间（秒）
   */
  set(key: string, value: string, expires?: number): void {
    localStorage.setItem(key, value);
    if (expires) {
      localStorage.setItem(
        `${key}${this.suffix}`,
        String(Date.parse(String(new Date())) + expires * 1000)
      );
    }
  },

  /**
   * 是否过期
   * @param key 关键字
   */
  isExpired(key: string): boolean {
    return (
      (this.getExpiration(key) || 0) - Date.parse(String(new Date())) <= 2000
    );
  },

  /**
   * 获取到期时间
   * @param key 关键字
   */
  getExpiration(key: string): number | null {
    const val = this.get(key + this.suffix);
    return val ? Number(val) : null;
  },

  /**
   * 移除
   * @param key 关键字
   */
  remove(key: string): void {
    localStorage.removeItem(key);
    this.removeExpiration(key);
  },

  /**
   * 移除到期时间
   * @param key 关键字
   */
  removeExpiration(key: string): void {
    localStorage.removeItem(key + this.suffix);
  },

  /**
   * 清理
   */
  clearAll(): void {
    localStorage.clear();
  },
};

export default storage;

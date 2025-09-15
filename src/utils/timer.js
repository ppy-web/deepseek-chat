export class Timer {
  constructor(autoStart = true) {
    this._startTime = 0;
    this._endTime = 0;
    this._isRunning = false;

    if (autoStart) {
      this.start();
    }
  }

  start() {
    if (this._isRunning) {
      console.warn("Timer is already running");
      return;
    }
    console.log(`output->开始计时`);
    this._startTime = performance.now();
    this._endTime = 0;
    this._isRunning = true;
  }

  stop() {
    if (!this._isRunning) {
      console.warn("Timer is not running");
      return 0;
    }
    console.log(`output->计时结束`);
    this._endTime = performance.now();
    this._isRunning = false;
    return this.duration;
  }

  /**
   * 停止计时并返回秒数（四舍五入）
   */
  stopSecondsRounded() {
    const seconds = Math.round(this.stop() / 1000);
    console.log(`output->获取时间`, seconds);
    return seconds;
  }

  reset() {
    this._startTime = 0;
    this._endTime = 0;
    this._isRunning = false;
  }

  restart() {
    this.reset();
    this.start();
  }

  get duration() {
    if (!this._startTime) return 0;

    const endTime = this._isRunning ? performance.now() : this._endTime;
    return endTime - this._startTime;
  }

  get durationSeconds() {
    return Math.round(this.stop() / 1000); // 返回整秒数
  }

  get isRunning() {
    return this._isRunning;
  }
}

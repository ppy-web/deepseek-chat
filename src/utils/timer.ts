/**
 * 计时器类
 * 用于测量操作耗时
 */
export class Timer {
  private _startTime: number = 0;
  private _endTime: number = 0;
  private _isRunning: boolean = false;

  constructor(autoStart: boolean = true) {
    if (autoStart) {
      this.start();
    }
  }

  start(): void {
    if (this._isRunning) {
      console.warn("Timer is already running");
      return;
    }
    this._startTime = performance.now();
    this._endTime = 0;
    this._isRunning = true;
  }

  stop(): number {
    if (!this._isRunning) {
      console.warn("Timer is not running");
      return 0;
    }
    this._endTime = performance.now();
    this._isRunning = false;
    return this.duration;
  }

  /**
   * 停止计时并返回秒数（四舍五入）
   */
  stopSecondsRounded(): number {
    return Math.round(this.stop() / 1000);
  }

  reset(): void {
    this._startTime = 0;
    this._endTime = 0;
    this._isRunning = false;
  }

  restart(): void {
    this.reset();
    this.start();
  }

  get duration(): number {
    if (!this._startTime) return 0;
    const endTime = this._isRunning ? performance.now() : this._endTime;
    return endTime - this._startTime;
  }

  get durationSeconds(): number {
    return Math.round(this.stop() / 1000);
  }

  get isRunning(): boolean {
    return this._isRunning;
  }
}

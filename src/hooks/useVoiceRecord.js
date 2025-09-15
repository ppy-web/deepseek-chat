// 让Recorder不打印
// Recorder.CLog = function () {};
// Recorder.TrafficImgUrl = "";
// Recorder.BufferSize = 4096;

// 浏览器通用录制语音方法
const voiceRecord = {
  rec: null,
  recBlob: null,
  /** 调用open打开录音请求好录音权限**/
  recOpen: (recOpenSuccess, recOnProcessCallback) => {
    voiceRecord.rec = null;
    voiceRecord.recBlob = null;
    const newRec = Recorder({
      type: "mp3",
      sampleRate: 16000,
      bitRate: 16, // mp3格式，指定采样率hz、比特率kbps，其他参数使用默认配置；注意：是数字的参数必须提供数字，不要用字符串；需要使用的type类型，需提前把格式支持文件加载进来，比如使用wav格式需要提前加载wav.js编码引擎
      onProcess: function (
        buffers,
        powerLevel,
        bufferDuration,
        bufferSampleRate,
        newBufferIdx,
        asyncEnd
      ) {
        if (recOnProcessCallback) {
          recOnProcessCallback(
            buffers,
            powerLevel,
            bufferDuration,
            bufferSampleRate,
            newBufferIdx,
            asyncEnd
          );
        }
      },
      audioTrackSet: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    newRec.open(
      function () {
        // 打开麦克风授权获得相关资源
        voiceRecord.rec = newRec;
        if (recOpenSuccess) {
          recOpenSuccess();
        }
      },
      function (msg, isUserNotAllow) {
        // 用户拒绝未授权或不支持
      }
    );
  },
  /** 关闭录音，释放资源**/
  recClose: (recCloseSuccess) => {
    if (voiceRecord.rec) {
      voiceRecord.rec.close();
      if (recCloseSuccess) {
        recCloseSuccess();
      }
      console.log("已关闭");
    } else {
      console.log("未打开录音");
    }
  },
  /** 开始录音**/
  recStart: () => {
    // 打开了录音后才能进行start、stop调用
    if (voiceRecord.rec && Recorder.IsOpen()) {
      voiceRecord.recBlob = null;
      console.log("已开始录音...");
      voiceRecord.rec.start();
    } else {
      console.log("未打开录音");
    }
  },
  /** 结束录音，得到音频文件**/
  recStop: (cb) => {
    if (!(voiceRecord.rec && Recorder.IsOpen())) {
      console.log("未打开录音");
      return;
    }
    voiceRecord.rec.stop(
      function (blob, duration) {
        voiceRecord.recBlob = blob;
        if (!blob || blob.size === 0) {
          return;
        } else {
          if (cb) {
            cb(blob, duration);
          }
        }
      },
      function (msg) {
        console.log("录音失败");
      }
    );
  },
  /** 取消录音 **/
  recCancel: () => {
    if (!(voiceRecord.rec && Recorder.IsOpen())) {
      console.log("未打开录音");
      return;
    }
    voiceRecord.rec.stop(
      function (blob, duration) {
        voiceRecord.recBlob = null;
      },
      function (msg) {
        console.log("录音失败");
      }
    );
  },
};

export function useVoiceRecord() {
  return voiceRecord;
}

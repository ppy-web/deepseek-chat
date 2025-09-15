import { useMitt } from "./useMitt";
import EVENT_TYPE from "@/constants/event_type";
const mitt = useMitt();

let stream = null;
let testAllPcm, testSampleRate, testInfo;
let testType, testDecode, testTransform;

export function useStreamPlayer() {
  const startPcm = function () {
    testType = "pcm";
    testDecode = false; //pcm无需解码，但必须将输入转换成pcm[Int16,...]
    testTransform = function (arrayBuffer, sampleRate, True, False) {
      //pcm需指定sampleRate，为传输过来pcm的采样率
      True(new Int16Array(arrayBuffer), sampleRate);
    };
    start();
  };
  const start = function () {
    if (stream) {
      stop();
    }

    testAllPcm = [];
    testInfo = {};

    stream = Recorder.BufferStreamPlayer({
      play: true,
      decode: testDecode, //传输过来的不是pcm就需要开启解码
      sampleRate: 16000, //pcm需要指定采样率
      onInputError: function (errMsg, inputIndex) {
        // console.log(
        //   "第" + inputIndex + "次的音频片段input输入出错: " + errMsg,
        //   1
        // );
      },
      onUpdateTime: function () {},
      onPlayEnd: function () {
        if (!stream.isStop) {
          // console.log("缓存区没有数据了，播放结束");
          mitt.emit(EVENT_TYPE.STREAM_PLAYER_END);
        }
      },
      transform: function (pcm, sampleRate, True, False) {
        testTransform(
          pcm,
          sampleRate,
          function (pcm, sampleRate) {
            True(pcm, sampleRate);

            testSampleRate = sampleRate;
            testAllPcm.push(pcm); //另存一份 结束时转成一个完整音频 对比接收到的数据音质
          },
          False
        );
      },
    });

    stream.start(
      function () {
        // console.log("stream已打开[" + testType + "]，正在播放中", 2);
      },
      function (err) {
        // console.log("开始失败：" + err, 1);
      }
    );
  };

  const stop = function () {
    if (stream) {
      stream.stop();
    }
    stream = 0;
  };
  const pause = function () {
    if (stream) {
      stream.pause();
    }
  };
  const resume = function () {
    if (stream) {
      stream.resume();
      // console.log("已恢复播放");
    }
  };

  const clearInput = function () {
    if (stream) {
      stream.clearInput();
      // console.log("已清除已输入但还未播放的数据，打断老的播放，播放新的");
    }
  };

  const setRealtimeOn = function (rtDiscardAll) {
    if (stream) {
      stream.set.realtime = true;
      if (rtDiscardAll) {
        stream.set.realtime = { discardAll: true };
      }
      // console.log(
      //   "切换成了实时模式，如果缓冲中积压的未播放数据量过大，会直接丢弃数据" +
      //     (rtDiscardAll ? "（discardAll=true）" : "并加速播放部分数据") +
      //     "，达到尽快播放新输入的数据的目的，可有效降低播放延迟"
      // );
    }
  };
  const setRealtimeOff = function () {
    if (stream) {
      // 切换成了非实时模式，所有输入的数据都会按顺序完整的播放
      stream.set.realtime = false;
    }
  };

  //实时的接收到了音频片段文件，通过input方法输入到流里面
  const receiveAudioChunk = function (arrayBuffer) {
    if (stream && !testInfo.receivePause) {
      testInfo.count = (testInfo.count || 0) + 1;
      var allSize = (testInfo.allSize =
        (testInfo.allSize || 0) + arrayBuffer.byteLength);
      if (allSize < 1024 * 900) {
        allSize = (allSize / 1024).toFixed(2) + "KB";
      } else {
        allSize = (allSize / 1024 / 1024).toFixed(2) + "MB";
      }

      stream.input(arrayBuffer);
    }
  };

  const setVolume = function (volume) {
    if (stream) {
      stream.setVolume(volume);
    }
  };

  return {
    startPcm,
    stop,
    pause,
    resume,
    clearInput,
    setRealtimeOn,
    setRealtimeOff,
    receiveAudioChunk,
    setVolume,
  };
}

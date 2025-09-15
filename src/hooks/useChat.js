/**
 * 聊天功能核心逻辑Hook
 * 负责管理聊天会话的完整生命周期，包括：
 * - 用户消息发送与状态跟踪
 * - AI流式响应接收与处理
 * - 语音流播放控制与3D模型动作协同
 * - 消息历史管理与滚动控制
 *
 * 核心依赖：
 * - Pinia状态管理：存储聊天状态和消息列表
 * - Mitt事件总线：处理跨组件事件通信（如语音播放、模型动作）
 * - fetch-event-source：实现SSE流式通信
 * - markdown渲染：将AI响应转换为富文本
 */
import { ref, computed, nextTick, reactive } from "vue";
import { defineStore } from "pinia";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import qs from "qs";
import { v4 as uuidv4 } from "uuid";
import * as service from "@/service/api";

import { useStore } from "./useStore"; // 全局状态管理
import { useMitt } from "./useMitt"; // 事件总线
import { useRefs } from "@/hooks/useRefs"; // DOM引用管理
import { useStreamPlayer } from "./useStreamPlayer"; // 语音流播放控制
import { useMarkdown } from "./useMarkdown"; // Markdown渲染
import { models } from "@/constants/models"; // AI模型配置
import EVENT_TYPE from "@/constants/event_type";
import MESSAGE_TYPE from "@/constants/message_type";
import { scrollTop, hexStringToByteArray, Timer, isEmpty } from "@/utils"; // 工具函数

/**
 * 错误提示类型
 * @constant {Object}
 * @property {string} APOLOGY - AI拒答或错误提示
 * @property {string} TIMEOUT - 请求超时提示
 */
const ERROR_TYPE = {
  APOLOGY: "Apology",
  TIMEOUT: "Timeout",
};

export function useChat() {
  // 全局状态引用
  const { app, config, user } = useStore();
  const mitt = useMitt();
  const { refs } = useRefs();
  const { clearInput, receiveAudioChunk } = useStreamPlayer();
  const { markdown } = useMarkdown();

  const voicePlayFlag = computed(() => config.info.voicePlayFlag); // 语音播放标志位
  const apologyHint = computed(() => config.info.apologyHint); // 错误提示文本
  const timeoutHint = computed(() => config.info.timeoutHint); // 超时提示文本
  const isPlayMp3 = computed(() => app.info.isPlayMp3); // MP3播放状态
  const isPlayStream = computed(() => app.info.isPlayStream); // 语音流播放状态
  const localModelIndex = computed(() => app.info.localModelIndex); // 当前选中模型索引
  const model = computed(() => models[localModelIndex.value].value); // 当前模型名称
  const netWorking = computed(() => config.info.netWorking); // 联网搜索展示状态
  const networkStatus = computed(() => app.info.networkStatus); // 是否联网搜索

  const needEmitStreamPlayerEnd = ref(true);

  const store = defineStore("chat", () => {
    /**
     * 消息列表
     * @type {Ref<Array>} - 包含所有聊天消息的响应式数组
     * BOT的消息格式：{
     *   mid: string,      // 消息唯一ID
     *   type: string,     // 消息类型（USER/BOT/CARD）
     *   content: string,  // 消息内容
     *   thinking: string, // 思考内容
     *   htmlThinking: string, // 思考内容的HTML渲染
     *   thinkFinished: boolean, // 思考是否完成
     *   thinkTime: number, // 思考用时
     *   htmlStr?: string, // Markdown渲染后的HTML（仅BOT消息）
     *   isPending: true,  // 是否正在处理
     *   isTextStreamEnd: false, // 文字是否处理完成
     *   getVoiceStream: false, // 是否已经获取到获取语音流（仅BOT消息）
     *   streamEnd: false,      // 流式响应是否结束（仅BOT消息）
     *   hasEmitStreamPlayerEnd?: false // 是否已触发播放结束事件（仅BOT消息）
     *
     *   uuid： 后台返回的消息id
     *   botMessageType?: number // 类型
     *        1：大模型
     *        2：普通业务办理
     *        3：可跳转业务办理
     *        4：带有文档来源
     *        5：faq
     *        6：表格
     *        7：返回的content内容是 可点击跳转的链接(集团客服 钉钉知识库 需求)
     *        8：问数
     *        12：联网搜索答案
     *        .....
     *   extraData: 存储表格
     *   appList: 推荐应用
     *   shardingInformation: 其他数据信息
     *   btns: 按钮点击可发送信息
     *   quote：文档的引用
     *   wenshu：问数数据
     *   suggestArray：推荐问题列表
     *   source：联网搜索来源
     * }
     */
    const messages = ref([]);
    // 新增消息
    const pushMessage = (msg) => {
      messages.value.push(msg);
    };

    // 删除消息
    const popMessage = () => {
      messages.value.pop();
    };

    // 清空消息列表
    const clearMessages = () => {
      messages.value = [];
    };

    // 显示聊天记录
    const showChatHistory = (msgList) => {
      clearMessages();
      messages.value = msgList;
      nextTick(() => {
        scrollMessageBox(500);
      });
    };

    // 点赞/点踩 最后一条消息
    const evaluateLastMsg = (status) => {
      messages.value[messages.value.length - 1].opsStatus = status;
      scrollMessageBox(500);
    };

    /**
     * 当前正在处理的消息
     * @type {Ref<Object|null>} - 指向当前活跃消息对象的响应式引用
     */
    const message = ref(null);

    /**
     * 自动滚动标志
     * @type {Ref<boolean>} - 控制消息框是否自动滚动到底部
     */
    const autoScroll = ref(true);

    /**
     * 请求控制器
     * @type {AbortController|null} - 用于中断未完成的流式请求
     */
    let controller = null;

    /**
     * 计时器
     * @type { Object|null } - 用于给思考过程计时
     */
    let timer = null;

    /**
     * 设置当前消息
     * @param {Object} data - 消息对象
     */
    const setMessage = (data) => {
      message.value = data;
    };

    /**
     * 点赞或踩
     * @type { Object }
     */
    const evaluateMessage = async (params) => {
      const evaluteObj = {};
      try {
        //...
        return true;
      } catch (error) {
        return false;
      }
    };

    // 智能体获取（试着问问）建议
    const getTryAsking = async () => {
      try {
        const { data = [] } = await service.tryAsking({
          msgid: message.value.messageId,
        });
        message.value.suggestArray = data;
      } catch (error) {
        console.log(error);
      }
    };

    /**
     * 设置自动滚动状态
     * @param {boolean} val - true:自动滚动到底部, false:保持当前位置
     */
    const setAutoScroll = (val) => {
      autoScroll.value = val;
    };

    /**
     * 滚动消息框到底部
     * 仅当autoScroll为true且消息框引用存在时执行
     */
    const scrollMessageBox = (duration = 20) => {
      if (refs.messageBoxRef && autoScroll.value) {
        nextTick(() => {
          scrollTop(
            document.querySelector(".chat-component .el-scrollbar__wrap"),
            duration
          );
        });
      }
    };

    /**
     * 处理文字流消息的各种数据
     */
    const handleTextStream = (data) => {
      if (data.type === 999) {
        message.value.uuid = data.uuid;
        return;
      }

      if (
        message.value.isPending &&
        (data.content || data.processInfo || data.thinking)
      ) {
        // 第一次获取到可展示的文本 认为pending结束
        message.value.isPending = false;
      }

      if (data.type === -1) {
        // 拒答情况：直接替换内容
        message.value.content = data.content;
        message.value.htmlStr = markdown.render(message.value.content);
        message.value.thinking = "";
        message.value.htmlThinking = "";
      } else {
        // 处理消息子类型（以第一次获取到的 type为准）
        if (!message.value.botMessageType) {
          message.value.botMessageType = data.type;
        }
        if (data.thinking) {
          if (isEmpty(timer)) {
            // console.log(`output->创建计时器`);
            timer = new Timer();
          }
          message.value.thinking = message.value.thinking + data.thinking;
        }
        // 流式内容
        if (data.content) {
          // 是否启动思考计时器
          if (!isEmpty(timer) && !message.value.thinkFinished) {
            message.value.thinkTime = timer?.stopSecondsRounded();
            message.value.thinkFinished = true;
            timer = null;
          }
          message.value.content += data.content;
        }
        // 按钮btns 点击可发送
        if (data.btns) {
          message.value.btns = data.btns;
        }
        // 推荐应用
        if (data.subappConfigList && data.subappConfigList.length > 0) {
          message.value.appList = data.subappConfigList;
        }
        // shardingInformation
        if (data.shardingInformation) {
          if (data.type === 4 || data.type === 13) {
            // 文档来源
            message.value.quote = data.shardingInformation;
            message.value.botMessageType = 4; // 统一修改消息类型为4
          } else if (data.type === 14) {
            // 联网搜索来源
            message.value.source = data.shardingInformation;
          } else if (data.type === 23) {
            // 推荐问题
            message.value.suggestArray =
              data.shardingInformation.suggested_questions;
          } else if (data.type === 8) {
            // 问数
            message.value.wenshu = {
              // 模拟问数数据
              // data: '{"columns":["2.1","2.2","2.3"],"index":[],"data":[[2,3,4]]}',
              // wenshuAnswerType: "4",
              data: data.shardingInformation,
              wenshuAnswerType: data.wenshuAnswerType,
              description: data.answerInformation,
              processInfo: data.processInfo,
              defaultScript: data.defaultScript,
            };
          }
        }

        if (data.processInfo) {
          message.value.processInfo = data.processInfo;
        } else {
          message.value.processInfo = "";
        }
        // 正常文本内容 md格式
        message.value.htmlStr = markdown.render(message.value.content);
        message.value.htmlThinking = markdown.render(message.value.thinking);
      }
      // 每次处理文本消息后尝试滚动到底部
      scrollMessageBox();
    };

    /**
     * 处理语音流消息
     */
    const handleVoiceStream = (data) => {
      // 首次接收到语音流时，触发3D模型说话动作
      if (!message.value.getVoiceStream && voicePlayFlag.value !== 3) {
        message.value.getVoiceStream = true; // 标记已开始接收语音流
        app.set({ isPlayStream: true });
      }
      // 如果有语音数据，转换为Uint8Array并传递给播放器
      if (data.content) {
        receiveAudioChunk(
          new Uint8Array(hexStringToByteArray(data.content)).buffer
        );
      }
      // 语音流结束标记
      if (data.finish === 1) {
        message.value.streamEnd = true;
        //  答案比较短时 可能 会先触发 EVENT_TYPE.STREAM_PLAYER_END ， 然后才获取到 语音流结束标记，  此时下面的代码可以停止模型的动作
        if (message.value.hasEmitStreamPlayerEnd) {
          app.set({ isPlayStream: false });
        }
      }
    };

    /**
     * 处理流式响应消息
     * 解析SSE返回的数据流，区分文本内容和语音流，更新UI状态
     * @param {Object} res - SSE响应对象
     */
    const handleStreamMessage = (res) => {
      try {
        const ret = JSON.parse(res.data);
        if (ret.code === 200) {
          const data = ret.data;
          // 当所有数据返回完成且为最终聊天类型时，隐藏打断按钮
          if (data.finish === 1 && data.chatType === "done") {
            app.set({ showInterruptBtn: false });
            message.value.isTextStreamEnd = true;
            scrollMessageBox(500);
          }
          // 判断agent文本内容是否结束
          if (data.finish === 1) {
            app.set({ showInterruptBtn: false });
            message.value.isTextStreamEnd = true;
            scrollMessageBox(500);
          }
          // chatType，点赞点踩的回显
          if (data.chatType && data.finish !== 1 && data.finish !== 11) {
            message.value.chatType = data.chatType;
          }
          if (!message.value.messageId && data.messageId) {
            message.value.messageId = data.messageId;
            parentMessageId.value = data.messageId;
            getTryAsking();
          }
          // 文本内容处理 (type !== 11表示非语音流数据)
          if (data.type !== 11) {
            data.type && handleTextStream(data);
          }
          // 语音流处理 (type === 11表示语音流数据)
          else {
            handleVoiceStream(data);
          }
        } else {
          // API返回错误码时，显示道歉提示
          handleStreamError(ERROR_TYPE.APOLOGY);
        }
      } catch (error) {
        console.error("处理流式消息失败:", error);
        handleStreamError(ERROR_TYPE.APOLOGY);
      }
    };

    /**
     * 处理流式请求错误
     * 统一错误处理逻辑，设置错误消息并更新相关状态
     * @param {string} errorType - 错误类型（APOLOGY/TIMEOUT）
     */
    const handleStreamError = (errorType) => {
      // 根据错误类型设置相应的提示内容
      message.value.content =
        errorType === ERROR_TYPE.APOLOGY
          ? apologyHint.value
          : timeoutHint.value;
      message.value.htmlStr = markdown.render(message.value.content);
      message.value.streamEnd = true; // 标记流已结束
      message.value.isPending = false;
      app.set({ showInterruptBtn: false }); // 隐藏打断按钮
      app.set({ isPlayStream: false });
      mitt.emit(EVENT_TYPE.PLAY_MP3, errorType); // 播放错误提示音效
    };

    /**
     * 查询AI回答（流式）
     * lastQuery:{} , 刷新token 的时候 重新发起请求
     * 发起SSE请求获取AI响应，处理文本和语音流数据
     */
    const queryAnswer = (lastQuery) => {
      // 创建新的中断控制器，用于后续可能的请求中断
      controller = new AbortController();
      const signal = controller.signal;
      let ask, botMessage, queryParams;
      if (!lastQuery) {
        ask = message.value.content; // 用户提问内容
        // 创建AI回复消息对象
        botMessage = {
          ask,
          mid: uuidv4(),
          type: MESSAGE_TYPE.BOT,
          content: "", // 原始文本内容
          htmlStr: "", // Markdown渲染后的HTML
          thinking: "", // 思考文本
          uuid: "", // 唯一标识，用于点赞点踩
          opsStatus: "0", // 点赞点踩状态
          chatType: "", // 回答接口返回的，用于点赞点踩传参
          htmlThinking: "", // 思考文本HTML
          thinkFinished: false, // 思考结束
          thinkTime: 0, // 思考用时
          isPending: true, // 是否正在处理
          getVoiceStream: false, // 是否正在获取语音流
          streamEnd: false, // 流是否结束
          hasEmitStreamPlayerEnd: false, // 是否已触发播放结束事件
          isTextStreamEnd: false,
          needUploadImg: false, // 需要上传图片
          suggestArray: [], // 建议列表
          list: [], // 推荐功能列表 点击跳转
          source: [], // 网络搜索来源
          quote: [], // faq来源
        };
        pushMessage(botMessage);
        setMessage(botMessage);
        scrollMessageBox(250);
      } else {
        ask = lastQuery.ask;
      }
      queryParams = {
        ask, // 用户提问
        sessionId: app.info.sessionId, // 会话ID
        model: model.value, // AI模型名称
        timestamp: new Date().getTime(), // 时间戳
        serviceModel: "default", // 服务模型
        datasetFlag: 0, // 数据集标志
        networkFlag: netWorking.value ? (networkStatus.value ? 1 : 0) : 0, // 网络标志
      };

      // 显示打断按钮
      app.set({ showInterruptBtn: true });
      app.set({ isPlayStream: false });
      mitt.emit(EVENT_TYPE.SEND_SUCCESS); // 触发发送成功事件
      // 发起流式请求
      fetchEventSource("/apis/virtualhuman/serverApi/question/streamAnswer", {
        method: "POST",
        headers: {
          "Blade-Auth": `bearer ${user.accessToken}`, // 认证令牌
          "Content-Type": "application/x-www-form-urlencoded",
        },
        signal, // 中断信号
        openWhenHidden: true, // 页面隐藏时仍保持连接
        body: qs.stringify(queryParams),
        // 处理接收到的消息
        onmessage: (res) => {
          handleStreamMessage(res);
        },
        // 处理401
        onopen: (res) => {
          if (res.status === 401) {
            // 尝试刷新token
            user
              .refreshTokenByCode()
              .then(() => {
                queryAnswer({
                  ask,
                  botMessage,
                });
              })
              .catch(() => {
                // 刷新token失败，退出重新登录
                user.logout();
              });
          }
        },
        // 处理错误
        onerror: () => handleStreamError(ERROR_TYPE.TIMEOUT),
      });
    };

    // 检测停止语音和动作
    const checkToStopMessage = () => {
      // 如果存在未完成的流式请求，先中断它
      if (message.value && !message.value.streamEnd && controller) {
        controller.abort();
      }

      checkDeleteLastMessage();

      // 处理语音播放状态
      // voicePlayFlag !== 3表示需要处理语音
      // 如果正在播放语音且未触发结束事件，清空播放器并设为待机
      if (
        voicePlayFlag.value !== 3 &&
        message.value &&
        isPlayStream.value &&
        message.value.getVoiceStream
      ) {
        needEmitStreamPlayerEnd.value = false;
        clearInput(); //clearInput 会触发  EVENT_TYPE.STREAM_PLAYER_END 事件 ( 否则下一条 botMessage 会有bug： 语音留结束 立即停止模型的动作问题)，NEED_EMIT_STREAM_PLAYER_END= false  触发事件不做任何处理
      }

      // 如果正在播放MP3，停止播放并设为待机
      if (isPlayMp3.value) {
        mitt.emit(EVENT_TYPE.PLAY_MP3, "");
      }
    };

    /**
     * 发送用户消息
     * 处理发送前的状态检查和准备，创建用户消息对象并触发AI查询
     * @param {string} val - 用户输入的消息内容
     */
    const sendMessage = (val) => {
      checkToStopMessage();

      setAutoScroll(true);

      // 创建用户消息对象
      const userMessage = {
        mid: uuidv4(),
        type: MESSAGE_TYPE.USER,
        content: val,
      };

      pushMessage(userMessage);
      setMessage(userMessage);
      queryAnswer(); // 触发AI查询

      scrollMessageBox(250);
    };

    /**
     * 取消当前回答请求
     * 中断正在进行的流式请求，更新状态并清理
     */
    const cancelAnswer = () => {
      checkDeleteLastMessage();
      if (message.value) {
        message.value.streamEnd = true; // 标记流结束
      }
      if (controller) {
        controller.abort(); // 中断请求
        controller = null;
      }
      app.set({ showInterruptBtn: false }); // 隐藏打断按钮
      app.set({ isPlayStream: false });
      if (voicePlayFlag.value !== 3) {
        clearInput(); // 清空语音播放器
      }
    };

    /**
     * 如果上一条消息 正在pending 需要删除
     */
    const checkDeleteLastMessage = () => {
      // 如果这条消息还在pending状态, 或者问数进度不问空 则删除当前message
      if (message.value) {
        if (message.value.isPending || message.value.processInfo) {
          popMessage();
          setMessage(null);
        }
      }
    };

    /**
     * 监听语音播放结束事件
     * 当语音流播放完成且消息流已结束时，触发模型待机状态
     * 答案比较长时 会先获取到 语音流结束标记 ， 然后再触发EVENT_TYPE.STREAM_PLAYER_END， 此时下面的代码可以停止模型的动作
     */
    mitt.on(EVENT_TYPE.STREAM_PLAYER_END, () => {
      if (!needEmitStreamPlayerEnd.value) {
        needEmitStreamPlayerEnd.value = true;
        return;
      }
      if (message.value) {
        message.value.hasEmitStreamPlayerEnd = true;
        if (message.value.streamEnd) {
          app.set({ isPlayStream: false });
        }
      }
    });

    /**
     * 推送卡片消息
     * 用于在聊天界面中动态添加卡片消息
     * @param {String} card - 卡片消息类型
     */
    const pushCard = (card) => {
      if (card === message.value?.card) return;
      const cardMessage = {
        type: MESSAGE_TYPE.CARD,
        mid: uuidv4(),
        card,
      };
      checkToStopMessage();
      setAutoScroll(true);
      setMessage(cardMessage);
      pushMessage(cardMessage);
      scrollMessageBox(500);
    };

    /**
     * 推送文件消息
     * 用于在聊天界面中动态添加文件消息
     * @param {String} file - 文件消息类型
     */
    const pushFile = (file) => {
      const fileMessage = {
        type: MESSAGE_TYPE.FILE,
        mid: uuidv4(),
        file,
      };

      checkToStopMessage();
      setAutoScroll(true);
      setMessage(fileMessage);
      pushMessage(fileMessage);
      scrollMessageBox(500);
    };

    return {
      messages,
      clearMessages,
      showChatHistory,
      setMessage,
      pushMessage,
      evaluateMessage,
      sendMessage,
      cancelAnswer,
      setAutoScroll,
      pushCard,
      pushFile,
      checkToStopMessage,
    };
  });

  return store();
}

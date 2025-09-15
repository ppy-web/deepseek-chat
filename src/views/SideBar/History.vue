<template>
  <div class="sidebar-history-title" v-if="list && list.length > 0">
    <span>历史会话</span> <img src="@/assets/img/history.png" alt="" />
  </div>
  <div
    v-infinite-scroll="loadData"
    class="history-list"
    :infinite-scroll-disabled="disabled"
    :key="listKey"
  >
    <div class="history-item" v-for="item in list" :key="item.sessionId">
      <div v-if="item.type === 'title'" class="history-title">
        {{ item.content }}
      </div>
      <div v-else class="history-content">
        <span class="h-content oneline" @click.stop="handleClickDialog(item)">{{
          item.content
        }}</span>
        <span
          class="options"
          :class="{ selected: selectedId == item.sessionId }"
          @click="selectedId = item.sessionId"
        >
          <el-popover
            :show-arrow="false"
            trigger="click"
            @hide="selectedId = ''"
            popper-class="history-item-popover"
            placement="bottom-start"
          >
            <div class="history-item-popover-content">
              <div class="options-item" @click.stop="handleRename(item)">
                <el-icon size="18" color="#1C1C1C"><Edit /></el-icon>
                <span
                  style="
                    padding: 0 5px 0 20px;
                    color: #1c1c1c;
                    font-weight: 500;
                  "
                  >重命名</span
                >
              </div>
              <div class="options-item" @click.stop="handleDelete(item)">
                <el-icon color="#FF3b30" size="18"><Delete /></el-icon>
                <span
                  style="
                    color: #ff3b30;
                    padding: 0 5px 0 20px;
                    font-weight: 500;
                  "
                  >删除</span
                >
              </div>
            </div>

            <template #reference>
              <svg
                class="icon"
                viewBox="0 0 1024 1024"
                width="16"
                height="16"
                fill="#616161"
              >
                <path
                  d="M415.93 223.79c0-52.98 43.004-95.984 95.984-95.984s95.984 43.004 95.984 95.984-43.004 95.984-95.984 95.984-95.984-43.003-95.984-95.984zM415.93 511.742c0-52.98 43.004-95.984 95.984-95.984s95.984 43.004 95.984 95.984-43.004 95.984-95.984 95.984-95.984-43.004-95.984-95.984zM415.93 799.866c0-52.98 43.004-95.984 95.984-95.984s95.984 43.003 95.984 95.984-43.004 95.983-95.984 95.983-95.984-43.175-95.984-95.983z"
                ></path>
              </svg>
              <!-- <el-icon color="#616161"><MoreFilled />   </el-icon> -->
            </template>
          </el-popover>
        </span>
      </div>
    </div>
    <div class="loading" v-if="loading">加载中...</div>
    <div class="finished" v-if="finished && !loading">
      {{ list.length > 0 ? "没有更多了~" : "" }}
    </div>
    <el-dialog
      v-model="show"
      class="dialog-round-confirm"
      width="411px"
      align-center
      :show-close="false"
      :destroy-on-close="true"
      append-to-body
      header-class="dialog-header"
    >
      <template #header="{ close }">
        <DialogTitle
          title="编辑对话名称"
          @close="
            close();
            renameValue = '';
          "
        />
      </template>
      <div class="confirm-content">
        <el-input
          ref="renameRef"
          v-model="renameValue"
          type="text"
          placeholder="请输入对话名称"
          :maxlength="20"
          style="height: 44px; --el-input-border-radius: 6px"
          show-word-limit
          :autofocus="true"
        />
      </div>

      <template #footer>
        <div style="padding-bottom: 20px">
          <el-button
            type="default"
            style="height: 32px; border-radius: 4px"
            @click="
              show = false;
              renameValue = '';
            "
          >
            取消
          </el-button>
          <el-button
            type="primary"
            style="
              height: 32px;
              border-radius: 4px;
              background: linear-gradient(90deg, #269efd 0%, #1677fe 100%);
              border: none;
            "
            @click="handleConfirm"
          >
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      v-model="showDel"
      class="dialog-round-confirm"
      width="420px"
      align-center
      :show-close="false"
      :destroy-on-close="true"
      append-to-body
      header-class="dialog-header"
    >
      <template #header="{ close }">
        <div class="header-container">
          <div class="header-l">
            <img src="@/assets/img/warning.png" />
            <span class="title" style="font-size: 18px">确定删除对话？</span>
          </div>
          <div class="header-r">
            <el-icon><CloseBold @click="close()" /></el-icon>
          </div>
        </div>
      </template>
      <div class="confirm-content">删除后的对话不可恢复。</div>
      <template #footer>
        <div style="padding-bottom: 20px">
          <el-button
            type="default"
            style="height: 32px; border-radius: 4px"
            @click="showDel = false"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            style="
              height: 32px;
              border-radius: 4px;
              background: #ff3b30;
              border: none;
            "
            @click="handleConfirmDelete"
            :disabled="handleLoading"
          >
            删除
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { MoreFilled, Edit, Delete, CloseBold } from "@element-plus/icons-vue";
import { getDayjsCategory } from "@/utils/index";
import { useRouter } from "vue-router";
import { useMitt } from "@/hooks/useMitt";
import { useStore } from "@/hooks/useStore";
import { useMarkdown } from "@/hooks/useMarkdown"; // Markdown渲染
import { v4 as uuidv4 } from "uuid";
import { successMsg, errorMsg, warningMsg } from "@/hooks/useMessage";
import * as service from "@/service/api";
import MESSAGE_TYPE from "@/constants/message_type";
import EVENT_TYPE from "@/constants/event_type";
import DialogTitle from "@/components/Common/DialogTitle.vue";

const { app } = useStore();
const { markdown } = useMarkdown();
const mitt = useMitt();
const router = useRouter();
const list = ref([]);
const loading = ref(false); // 是否加载中
const finished = ref(false); // 是否加载完成
const pageSize = 20; // 每页显示条数
const current = ref(1); // 页码
const retryCount = ref(0);
const retryLimit = 1; // 超时重试次数限制
const listKey = ref(0);
const disabled = computed(() => loading.value || finished.value);
let currentDateType = null; // 对话列表当前日期类型
const selectedId = ref(""); // 当前选中二级菜单的会话id
const renameValue = ref(""); // 重命名输入框的值
const show = ref(false); // 是否显示重命名弹窗
const renameRef = ref(null); // 重命名输入框的ref
const showDel = ref(false); // 是否显示删除弹窗
const activeDialog = ref(null); // 当前点击的对话项
const handleLoading = ref(false); // 是否显示加载中

const loadData = () => {
  loading.value = true;
  // 模拟返回数据
  list.value.push({ name: "对话", content: "对话" });
  loading.value = false;
};
const handleClickDialog = async (item) => {
  const { appid, sessionId, qaList } = item;
  try {
    // 点击对话列表的对话详情sessionId
    const { records } = await service.sessionLogDetail(sessionId, true);
    const messages = [];
    records[0].qaList.forEach((ele) => {
      messages.push({
        isPending: false,
        botMessageType: 1,
        isHistory: true,
        chatType: ele.chatType || "chat",
        isTextStreamEnd: true,
        streamEnd: true,
        type: ele.type === 2 ? MESSAGE_TYPE.BOT : MESSAGE_TYPE.USER,
        content: ele.content,
        htmlStr: ele.content
          ? markdown.render(ele.content)
          : "当前问题没有回答",
        opsStatus: ele.evaluate + "",
        uuid: ele.uuid,
        mid: uuidv4(),
      });
    });
    router.push("/");
    app.set({
      isNewDialog: false,
      sessionId: sessionId,
      chatObj: {
        type: "assistant",
        showTryAsking: true,
      },
    });

    setTimeout(() => {
      mitt.emit(EVENT_TYPE.SHOW_CHAT_HISTORY, messages);
    }, 100);
  } catch (err) {
    console.log("获取对话记录失败", err);
  }
};
const handleRename = (item) => {
  activeDialog.value = item;
  renameValue.value = item.content;
  show.value = true;
  console.log(renameRef.value);
  nextTick(() => {
    renameRef.value?.focus();
  });
};
const handleDelete = (item) => {
  activeDialog.value = item;
  showDel.value = true;
};
const handleConfirm = async () => {
  if (renameValue.value.trim() === "") {
    warningMsg("请输入新的对话标题");
    return;
  }
  if (renameValue.value.trim() === activeDialog.value.content) {
    warningMsg("新标题不能和原标题相同");
    return;
  }
  try {
    handleLoading.value = true;
    const res = service.updateSessionLog({
      id: activeDialog.value.sessionId,
      title: renameValue.value.trim(),
    });
    successMsg("重命名成功");
    activeDialog.value.content = renameValue.value;
    show.value = false;
    renameValue.value = "";
  } catch (error) {
    errorMsg(error);
  } finally {
    handleLoading.value = false;
  }
};
const handleConfirmDelete = async () => {
  try {
    handleLoading.value = true;
    const res = await service.deleteOneSessionLog(activeDialog.value.sessionId);
    successMsg("删除成功");
    showDel.value = false;
    list.value = list.value.filter(
      (item) => item.sessionId !== activeDialog.value.sessionId
    );
  } catch (error) {
    errorMsg(error);
  } finally {
    handleLoading.value = false;
  }
};
onMounted(() => {
  mitt.on(EVENT_TYPE.INIT_SUCCESS, () => {
    list.value = [];
    retryCount.value = 0;
    loading.value = false;
    finished.value = false;
    current.value = 1;
    listKey.value++;
  });
});
</script>

<style lang="scss" scoped>
.sidebar-history-title {
  border-top: 1px solid #e7e7e7;
  padding-top: 16px;
  padding-bottom: 10px;
  font-size: 14px;
  color: #aaaaac;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  img {
    width: 18px;
  }
}
.history-list {
  height: 100%;
  font-size: 14px;
  overflow-y: auto;
  scrollbar-width: thin; /* auto | thin | none */
  scrollbar-color: #c1c1c1 #f4f5f6; /* 滑块颜色 轨道颜色 */

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background-color: #f4f5f6;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #c1c1c1;
    border-radius: 3px;
  }
  .history-item {
    .history-title {
      color: #616161;
      margin: 12px 0;
      padding: 0 6px;
    }
    .history-content {
      color: rgba(0, 0, 0, 0.6);
      cursor: pointer;
      border-radius: 10px;
      padding: 0 6px;
      height: 42px;
      line-height: 42px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .h-content {
        flex: 1;
      }
      .options {
        display: none;
        margin-right: 10px;
        margin-left: 10px;
        line-height: 20px;
        width: 20px;
        text-align: center;
        height: 20px;
        border-radius: 4px;
        &:hover {
          background-color: #cfcfcf;
        }
        .icon {
          vertical-align: middle;
        }
      }
      .selected {
        display: inline-block;
      }
      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
        .options {
          display: inline-block;
        }
      }
    }
  }
  .finished {
    margin-top: 20px;
    text-align: center;
    color: #999;
    font-size: 12px;
  }
  .loading {
    text-align: center;
    color: #999;
    font-size: 12px;
  }
}
</style>

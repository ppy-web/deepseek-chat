<script setup>
import { ref, nextTick, computed } from "vue";
import { Edit, Delete, CloseBold } from "@element-plus/icons-vue";
import { getDayjsCategory } from "@/utils/index";
import { useChatStore, useHistoryStore, useAppStore } from "@/store";
import { successMsg, errorMsg, warningMsg } from "@/hooks/useMsg";
import DialogTitle from "@/components/Common/DialogTitle.vue";

const selectedId = ref(""); // 当前选中二级菜单的会话id
const renameValue = ref(""); // 重命名输入框的值
const show = ref(false); // 是否显示重命名弹窗
const renameRef = ref(null); // 重命名输入框的ref
const showDel = ref(false); // 是否显示删除弹窗
const activeDialog = ref(null); // 当前点击的对话项
const handleLoading = ref(false); // 是否显示加载中
let currentDateType = null; // 对话列表当前日期类型

const app = useAppStore();
const chat = useChatStore();
const history = useHistoryStore();
history.loadSessions();

const currendId = app.currentId;
const list = computed(() => {
  const data = [];
  history.sessions.forEach((item) => {
    const { timestamp } = item;
    const dateType = getDayjsCategory(timestamp);
    if (dateType !== currentDateType) {
      data.push({
        type: "title",
        content: dateType,
      });
      currentDateType = dateType;
    } else {
      item.active = currendId === item.id;
    }
    data.push(item);
  });
  return data;
});

const handleClickDialog = (item) => {
  console.log(item);
  try {
    const { id } = item;
    chat.initMessages(id);
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
    successMsg("重命名功能开发中~");
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
    await history.deleteSession(activeDialog.value.id)
    successMsg("删除成功");
    showDel.value = false;
  } catch (error) {
    errorMsg(error);
  } finally {
    handleLoading.value = false;
  }
};
</script>

<template>
  <div class="sidebar-history-title">
    <span>历史会话</span> <i-streamline-stickies-color:time />
  </div>
  <div class="history-list">
    <div class="history-item" v-for="item in list" :key="item.id">
      <div v-if="item.type === 'title'" class="history-title">
        {{ item.content }}
      </div>
      <div v-else class="history-content" :class="{ active: chat.sessionId == item.id }">
        <span class="h-content oneline" @click.stop="handleClickDialog(item)">{{ item.name }}
        </span>
        <span class="options" :class="{ selected: selectedId == item.id }" @click="selectedId = item.id">
          <el-popover :show-arrow="false" trigger="click" @hide="selectedId = ''" popper-class="history-item-popover"
            placement="bottom-start">
            <div class="history-item-popover-content">
              <div class="options-item" @click.stop="handleRename(item)">
                <el-icon size="18" color="#1C1C1C">
                  <Edit />
                </el-icon>
                <span style="
                    padding: 0 5px 0 20px;
                    color: #1c1c1c;
                    font-weight: 500;
                  ">重命名</span>
              </div>
              <div class="options-item" @click.stop="handleDelete(item)">
                <el-icon color="#FF3b30" size="18">
                  <Delete />
                </el-icon>
                <span style="
                    color: #ff3b30;
                    padding: 0 5px 0 20px;
                    font-weight: 500;
                  ">删除</span>
              </div>
            </div>

            <template #reference>
              <svg class="icon" viewBox="0 0 1024 1024" width="16" height="16" fill="#616161">
                <path
                  d="M415.93 223.79c0-52.98 43.004-95.984 95.984-95.984s95.984 43.004 95.984 95.984-43.004 95.984-95.984 95.984-95.984-43.003-95.984-95.984zM415.93 511.742c0-52.98 43.004-95.984 95.984-95.984s95.984 43.004 95.984 95.984-43.004 95.984-95.984 95.984-95.984-43.004-95.984-95.984zM415.93 799.866c0-52.98 43.004-95.984 95.984-95.984s95.984 43.003 95.984 95.984-43.004 95.983-95.984 95.983-95.984-43.175-95.984-95.983z">
                </path>
              </svg>
              <!-- <el-icon color="#616161"><MoreFilled />   </el-icon> -->
            </template>
          </el-popover>
        </span>
      </div>
    </div>
    <div class="finished">
      {{ list.length > 0 ? "没有更多了~" : "" }}
    </div>
    <el-dialog v-model="show" class="dialog-round-confirm" width="411px" align-center :show-close="false"
      :destroy-on-close="true" append-to-body header-class="dialog-header">
      <template #header="{ close }">
        <DialogTitle title="编辑对话名称" @close="
          close();
        renameValue = '';
        " />
      </template>
      <div class="confirm-content">
        <el-input ref="renameRef" v-model="renameValue" type="text" placeholder="请输入对话名称" :maxlength="20"
          style="height: 44px; --el-input-border-radius: 6px" show-word-limit :autofocus="true" />
      </div>

      <template #footer>
        <div style="padding-bottom: 20px">
          <el-button type="default" style="height: 32px; border-radius: 4px" @click="
            show = false;
          renameValue = '';
          ">
            取消
          </el-button>
          <el-button type="primary" style="
              height: 32px;
              border-radius: 4px;
              background: linear-gradient(90deg, #269efd 0%, #1677fe 100%);
              border: none;
            " @click="handleConfirm">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="showDel" class="dialog-round-confirm" width="420px" align-center :show-close="false"
      :destroy-on-close="true" append-to-body header-class="dialog-header">
      <template #header="{ close }">
        <div class="header-container">
          <div class="header-l">
            <img src="@/assets/img/warning.png" />
            <span class="title" style="font-size: 18px">删除对话？</span>
          </div>
          <div class="header-r">
            <el-icon>
              <CloseBold @click="close()" />
            </el-icon>
          </div>
        </div>
      </template>
      <div class="confirm-content">删除后不可恢复。</div>
      <template #footer>
        <div style="padding-bottom: 20px">
          <el-button type="default" style="height: 32px; border-radius: 4px" @click="showDel = false">
            取消
          </el-button>
          <el-button type="primary" style="
              height: 32px;
              border-radius: 4px;
              background: #ff3b30;
              border: none;
            " @click="handleConfirmDelete" :disabled="handleLoading">
            删除
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>


<style lang="scss" scoped>
.sidebar-history-title {
  border-top: 1px solid #e7e7e7;
  padding-top: 16px;
  padding-bottom: 10px;
  font-size: 14px;
  color: #666;
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
  scrollbar-width: thin;
  /* auto | thin | none */
  scrollbar-color: #c1c1c1 #f4f5f6;
  /* 滑块颜色 轨道颜色 */

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
      color: #999999;
      margin: 12px 0;
      font-size: 12px;
      padding: 0 6px;
    }

    .history-content {
      color: #333;
      cursor: pointer;
      border-radius: 10px;
      padding: 0 6px;
      height: 42px;
      line-height: 42px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-left: 16px;
      margin-bottom: 5px;

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

    .active {
      background-color: #e4edfd;
      color: #3964fe;
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

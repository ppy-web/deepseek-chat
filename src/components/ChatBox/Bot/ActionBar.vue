<!-- 操作栏 -->
<template>
  <div class="action-container">
    <div class="action-list animate__animated">
      <div
        class="action-item"
        :class="{ animate__heartBeat: isClickCopy }"
        @click="onHandleCopy"
      >
        <el-tooltip effect="customized" content="复制" placement="top">
          <img :src="copyImg" />
        </el-tooltip>
        <span ref="MsgRef" v-html="props.content" style="display: none"></span>
      </div>
      <div
        class="action-item"
        :class="{ animate__heartBeat: isClickLike }"
        @click="onHandleLike"
      >
        <el-tooltip effect="customized" content="喜欢" placement="top">
          <img :src="likeImg" />
        </el-tooltip>
      </div>
      <div
        class="action-item"
        :class="{ animate__heartBeat: isClickUnLike }"
        @click="onHandleTread"
      >
        <el-tooltip effect="customized" content="不喜欢" placement="top">
          <img :src="unlikeImg" />
        </el-tooltip>
      </div>
    </div>
    <el-dialog
      v-model="show"
      class="dialog-round"
      width="611px"
      align-center
      :show-close="false"
      :destroy-on-close="true"
      append-to-body
      header-class="dialog-header"
    >
      <template #header="{ close }">
        <DialogTitle title="问题反馈" @close="close()" />
      </template>
      <div class="tags-content">
        <div class="tags">
          <div
            class="tag"
            v-for="(item, index) in tagsArr"
            :key="index"
            :class="{ active: item === feedType }"
            @click="feedType = item"
          >
            {{ item }}
          </div>
        </div>
        <div class="item">
          <div style="color: #666; font-size: 15px; margin-bottom: 15px">
            <span style="color: #ff0000">* </span>请详述问题
          </div>
          <el-input
            ref="evaluateRef"
            v-model="evaluteValue"
            :autosize="{ minRows: 3, maxRows: 5 }"
            type="textarea"
            placeholder="请输入您遇到的问题"
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button
            type="primary"
            style="
              width: 200px;
              height: 44px;
              background: linear-gradient(90deg, #269efd 0%, #1677fe 100%);
              border-radius: 6px;
              border: none;
            "
            @click="onHandleTreadConfig"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "@/hooks/useStore";
import { useStreamPlayer } from "@/hooks/useStreamPlayer.js";
import { addTokenToUrl, jumpHttp } from "@/utils/index";
import { smartCopy } from "@/utils";
import { result } from "lodash";

import copyImg from "@/assets/img/copypc.png";
import notgoodImg from "@/assets/img/notgood.png";
import notgoodActiveImg from "@/assets/img/notgood1.png";
import goodImg from "@/assets/img/good.png";
import goodActiveImg from "@/assets/img/good1.png";
import message from "@/hooks/useMessage";
import DialogTitle from "@/components/Common/DialogTitle.vue";

const emit = defineEmits(["like", "unlike"]);
const { config } = useStore();

const props = defineProps({
  content: String,
  status: {
    type: String,
    default: "0",
  },
});
const MsgRef = ref(null);
const evaluateRef = ref(null);
const show = ref(false);
const isClickCopy = ref(false);
const isClickLike = ref(false);
const isClickUnLike = ref(false);
const tagsArr = computed(() => config.info.tags);
const feedType = ref("");
const evaluteValue = ref("");

const likeImg = computed(() => {
  return props.status === "1" ? goodActiveImg : goodImg;
});
const unlikeImg = computed(() => {
  return props.status === "2" ? notgoodActiveImg : notgoodImg;
});

const onHandleCopy = async () => {
  isClickCopy.value = true;
  setTimeout(() => {
    isClickCopy.value = false;
  }, 1000);
  const result = await smartCopy(MsgRef.value);
  result.success && message.success("复制成功");
};

const onHandleLike = () => {
  // console.log("赞！！！！！！！");
  isClickLike.value = true;
  emit("like");
  setTimeout(() => {
    isClickLike.value = false;
  }, 1000);
};

const onHandleTread = () => {
  show.value = true;
  feedType.value = tagsArr.value[0];
  evaluteValue.value = "";
  isClickUnLike.value = true;
  setTimeout(() => {
    isClickUnLike.value = false;
  }, 1000);
};
const onHandleTreadConfig = () => {
  if (!evaluteValue.value) {
    message.error("请填写您遇到的问题");
    evaluateRef.value?.focus();
  } else {
    show.value = false;
    emit("unlike", {
      feedType: feedType.value,
      evaluteValue: evaluteValue.value,
    });
  }
};
</script>

<style lang="scss" scoped>
.action-container {
  margin-top: 12px;
  .action-list {
    gap: 16px;
    display: flex;
    align-items: center;
    width: 100%;
    .action-item {
      cursor: pointer;
      img {
        width: 16px;
        height: 16px;
      }
    }
  }
}
</style>

<!-- 用于展示回答网络搜索来源 -->
<template>
  <div class="network-container">
    <div class="network-title" @click="show = !show">
      <span>已搜索到{{ list.length }}个网页</span>
      <el-icon><ArrowRight color="#666666" /></el-icon>
    </div>
    <el-drawer
      v-model="show"
      :modal="true"
      :fullscreen="false"
      :show-close="false"
      direction="rtl"
      append-to-body
      :size="370"
      close-on-click-modal
      class="float-drawer"
      header-class="float-header"
      modal-class="float-modal"
    >
      <template #header="{ close }">
        <DialogTitle :title="`搜索来源(${list.length})`" @close="close()" />
      </template>
      <el-scrollbar height="100%" always>
        <div class="source-wrap">
          <div v-for="(item, index) in list" :key="index" class="source-item">
            <div class="source-content" @click="showSourceDetail(item)">
              <div class="name">{{ index + 1 }}. {{ item.ref_name }}</div>
              <div class="content">{{ item.ref_content }}</div>
            </div>
            <div class="source-bottom oneline">
              <load-fetchimg
                class="icon"
                :url="item.web_site_icon"
                :fallback="fallbackImg"
              ></load-fetchimg>
              <div class="sitename">{{ item.web_site_name }}</div>
              <div
                class="url oneline"
                :title="decodeURIComponent(item.web_page_url)"
              >
                {{ decodeURIComponent(item.web_page_url) }}
              </div>
              <div class="time">
                {{ formatDate(item.web_date_published) }}
              </div>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { jumpHttp } from "@/utils";
import { ArrowRight } from "@element-plus/icons-vue";

import dayjs from "dayjs";
import fallbackImg from "@/assets/img/urlImg.png";
import DialogTitle from "@/components/Common/DialogTitle.vue";
import LoadFetchimg from "@/components/Common/LoadFetchimg.vue";
const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
});
const show = ref(false);
const showSource = (item) => {
  console.log(item);
};
const formatDate = (date) => {
  if (date) {
    return dayjs().format("YYYY-MM-DD");
  } else {
    return "";
  }
};
const showSourceDetail = (item) => {
  let url = item.web_page_url;
  jumpHttp(url);
};
</script>

<style lang="scss" scoped>
.network-container {
  margin-bottom: 10px;
  .network-title {
    font-size: 16px;
    color: #666666;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    width: fit-content;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    cursor: pointer;
  }
  .network-content {
    margin-bottom: 10px;
  }
  .network-item {
    color: #1989fa;
    padding: 5px 0;
  }
}
</style>

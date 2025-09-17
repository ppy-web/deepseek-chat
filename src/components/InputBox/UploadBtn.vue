<!-- 唤起上传文件的按钮 -->
<script setup>
import { ref, inject, computed } from "vue";
// import { uploadFile } from "@/service/api";
import { warningMsg } from "@/hooks/useMessage";
import { useStore } from "@/hooks/useStore";
import { genFileId } from "element-plus";
const { user } = useStore();
const emit = defineEmits(["fileUploaded"]);
const upload = ref(null);
const loading = ref(false);
const fileChange = (file) => {
  if (file.status === "ready") {
    upload.value?.submit();
  }
};
const handleExceed = (files) => {
  upload.value?.clearFiles();
  const file = files[0];
  file.uid = genFileId();
  upload.value?.handleStart(file);
};

const beforeUpload = (file) => {
  if (file.size > 20 * 1024 * 1024) {
    warningMsg("文件大小不能超过20M");
    return false;
  }
  return true;
};
const handleHttpRequest = async (options) => {
  loading.value = true;
  const formData = new FormData();
  formData.append("file", options.file);
  try {
    // const res = await uploadFile(formData);
    // const uploadedFile = {
    //   name: options.file.name,
    //   size: options.file.size,
    //   type: options.file.type,
    //   link: res.link,
    // };
    loading.value = false;
    options.onSuccess(res.data);
    emit("fileUploaded", [uploadedFile]);
  } catch (err) {
    loading.value = false;
    options.onError(err);
  }
};
</script>
<template>
  <div
    v-loading.fullscreen.lock="loading"
    element-loading-text="上传中..."
    element-loading-background="rgba(0, 0, 0, 0.6)"
    class="file-uploader"
  >
    <el-tooltip
      effect="customized"
      content="上传附件 (功能开发中)"
      placement="top"
    >
      <el-upload
        ref="upload"
        accept=".docx,.pdf,.txt,.md"
        :auto-upload="false"
        :show-file-list="false"
        :http-request="handleHttpRequest"
        :on-exceed="handleExceed"
        :before-upload="beforeUpload"
        :on-change="fileChange"
        :limit="1"
      >
        <div class="plus-icon">
          <img src="@/assets/img/paper.png" />
        </div>
      </el-upload>
    </el-tooltip>
  </div>
</template>

<style lang="scss" scoped>
.file-uploader {
  margin-right: 10px;
  height: 30px;
  width: 30px;
  line-height: 30px;
  border-radius: 10px;
  &:hover {
    background: #e0e4ed;
  }
  .plus-icon {
    height: 30px;
    width: 30px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    img {
      width: 30px;
      line-height: 30px;
    }
  }
}
</style>

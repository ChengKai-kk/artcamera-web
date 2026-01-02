<template>
  <div class="app-page">
    <h1>艺术照片生成</h1>

    <!-- 状态提示 -->
    <div v-if="status === 'idle'">
      <button class="primary btn" @click="startGenerate">开始生成</button>
    </div>

    <div v-if="status === 'generating'">
      <p>正在生成中，请稍候…</p>
      <div class="loader"></div>
    </div>

    <div v-if="status === 'success'">
      <p>生成完成</p>
      <img :src="resultUrl" class="result-image" />
      <div class="actions">
          <button class="primary btn" @click="goSave">
          去扫码保存
        </button>
      </div>
    </div>

    <div v-if="status === 'error'">
      <p class="error">{{ errorMsg }}</p>
      <button @click="reset">重新生成</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { AI_CONFIG } from "@/config/ai";

const router = useRouter();

const status = ref("idle"); // idle | generating | success | error
const errorMsg = ref("");
const resultUrl = ref("");
const taskId = ref("");
let timer = null;

// 👉 这里先假设：
// imageBase64、styleId 是从上一页带过来的
// 你可以后面再精细化
const imageBase64 = sessionStorage.getItem("imageBase64");
const styleId = sessionStorage.getItem("styleId") || "anime";

async function startGenerate() {
  if (!imageBase64) {
    status.value = "error";
    errorMsg.value = "未获取到照片数据";
    return;
  }

  status.value = "generating";

  try {
    // 1️⃣ 创建任务
    const resp = await fetch(`${AI_CONFIG.BASE_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Token": AI_CONFIG.API_TOKEN,
      },
      body: JSON.stringify({
        styleId,
        imageBase64,
      }),
    });

    const data = await resp.json();
    if (!resp.ok || !data.taskId) {
      throw new Error(data.error || "生成任务创建失败");
    }

    taskId.value = data.taskId;

    // 2️⃣ 开始轮询
    pollTask();
  } catch (err) {
    status.value = "error";
    errorMsg.value = err.message || "生成失败";
  }
}

function pollTask() {
  clearInterval(timer);

  timer = setInterval(async () => {
    try {
      const resp = await fetch(
        `${AI_CONFIG.BASE_URL}/tasks/${taskId.value}`,
        {
          headers: {
            "X-API-Token": AI_CONFIG.API_TOKEN,
          },
        }
      );

      const data = await resp.json();

      if (data.status === "SUCCEEDED") {
        resultUrl.value = data.resultUrl;
        status.value = "success";
        clearInterval(timer);
      } else if (data.status === "FAILED") {
        throw new Error(data.error || "生成失败");
      }
    } catch (err) {
      status.value = "error";
      errorMsg.value = err.message || "轮询失败";
      clearInterval(timer);
    }
  }, AI_CONFIG.POLL_INTERVAL);
}

function goSave() {
  // 把 resultUrl 带到下一页
  sessionStorage.setItem("resultUrl", resultUrl.value);
  router.push("/save");
}

function reset() {
  status.value = "idle";
  errorMsg.value = "";
  resultUrl.value = "";
  taskId.value = "";
}

onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>

<style scoped>
.generate-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #0f0f0f;
  color: #fff;
}

.primary {
  padding: 14px 32px;
  font-size: 20px;
  border-radius: 8px;
  border: none;
  background: #ff8a00;
  color: #000;
}

.loader {
  margin-top: 20px;
  width: 48px;
  height: 48px;
  border: 4px solid #333;
  border-top-color: #ff8a00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.result-image {
  max-width: 70vw;
  max-height: 60vh;
  border-radius: 12px;
  margin-top: 20px;
}

.actions {
  margin-top: 20px;
}

.error {
  color: #ff4d4f;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

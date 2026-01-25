<template>
  <div class="app-page generate-page">
    <header class="page-top">
      <button class="home-btn" type="button" @click="goHome" aria-label="home">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4.2 3 11.4v7.4a1 1 0 0 0 1 1h5.2v-5.6h5.6v5.6H20a1 1 0 0 0 1-1v-7.4l-9-7.2Z" />
        </svg>
      </button>
      <div>
        <div class="page-title-cn">照片生成效果</div>
        <div class="page-title-en">PHOTO GENERATION EFFECT</div>
      </div>
      <div class="page-timer">{{ timerText }}</div>
    </header>

    <section class="panel result-panel">
      <div v-if="status === 'success'" class="result-wrap">
        <img :src="resultUrl" class="result-image" alt="result" />
      </div>
      <div v-else class="result-placeholder" :class="status">
        <div class="orb"></div>
        <div class="hint">
          {{ status === "error" ? "生成失败，请重试" : "AI 影像处理中" }}
        </div>
      </div>
    </section>

    <div class="action-row">
      <button v-if="status === 'success'" class="btn btn-primary" @click="openQr">
        查看二维码
      </button>
      <button v-if="status === 'success'" class="btn btn-ghost" @click="goHome">
        返回主页
      </button>
      <button v-if="status === 'error'" class="btn btn-primary" @click="reset">
        重新生成
      </button>
    </div>

    <div v-if="status === 'error'" class="error-msg">{{ errorMsg }}</div>

    <div v-if="showQr" class="qr-overlay">
      <div class="qr-card">
        <div class="qr-robot">AI</div>
        <div class="qr-title">照片下载中</div>
        <div class="qr-frame">
          <img v-if="qrDataUrl" :src="qrDataUrl" class="qr-img" alt="qr" />
          <div v-else class="loading">二维码生成中...</div>
          <div class="qr-label">二维码</div>
        </div>
        <div class="qr-actions">
          <div class="qr-cta">扫描二维码获取电子版照片</div>
          <button class="btn btn-ghost" @click="goHome">返回首页</button>
        </div>
        <div class="qr-countdown">
          <div class="countdown-label">返回倒计时</div>
          <div class="countdown-value">{{ idleSeconds }}s</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import QRCode from "qrcode";
import { AI_CONFIG } from "@/config/ai";

const router = useRouter();

const status = ref("idle");
const errorMsg = ref("");
const resultUrl = ref("");
const taskId = ref("");
const autoStarted = ref(false);
let pollTimer = null;

const showQr = ref(false);
const qrDataUrl = ref("");

const imageBase64 = sessionStorage.getItem("imageBase64");
const styleId = sessionStorage.getItem("styleId") || "default";

const totalSeconds = 120;
const timer = ref(totalSeconds);
let timerId = null;

const IDLE_MS = 60 * 1000;
const idleSeconds = ref(Math.floor(IDLE_MS / 1000));
let idleTimer = null;
let countdownTimer = null;
let lastActiveAt = Date.now();
let unbindIdle = null;

const timerText = computed(() => `${timer.value}s`);

async function startGenerate() {
  if (!imageBase64) {
    status.value = "error";
    errorMsg.value = "未获取到照片数据";
    return;
  }

  status.value = "generating";

  try {
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
    pollTask();
  } catch (err) {
    status.value = "error";
    errorMsg.value = err.message || "生成失败";
  }
}

function pollTask() {
  clearInterval(pollTimer);

  pollTimer = setInterval(async () => {
    try {
      const resp = await fetch(`${AI_CONFIG.BASE_URL}/tasks/${taskId.value}`, {
        headers: {
          "X-API-Token": AI_CONFIG.API_TOKEN,
        },
      });

      const data = await resp.json();

      if (data.status === "SUCCEEDED") {
        resultUrl.value = data.resultUrl;
        sessionStorage.setItem("resultUrl", resultUrl.value);
        status.value = "success";
        clearInterval(pollTimer);
      } else if (data.status === "FAILED") {
        throw new Error(data.error || "生成失败");
      }
    } catch (err) {
      status.value = "error";
      errorMsg.value = err.message || "轮询失败";
      clearInterval(pollTimer);
    }
  }, AI_CONFIG.POLL_INTERVAL);
}

async function makeQr(url) {
  qrDataUrl.value = await QRCode.toDataURL(url, {
    width: 320,
    margin: 1,
  });
}

function resetIdle() {
  lastActiveAt = Date.now();
  idleSeconds.value = Math.ceil(IDLE_MS / 1000);
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    router.replace("/");
  }, IDLE_MS);
}

function bindIdleEvents() {
  const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
  const opts = { passive: true };
  events.forEach((ev) => window.addEventListener(ev, resetIdle, opts));

  resetIdle();
  countdownTimer = setInterval(() => {
    const elapsed = Date.now() - lastActiveAt;
    const left = Math.max(0, Math.ceil((IDLE_MS - elapsed) / 1000));
    idleSeconds.value = left;
  }, 1000);

  return () => {
    events.forEach((ev) => window.removeEventListener(ev, resetIdle));
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = null;
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = null;
  };
}

async function openQr() {
  if (!resultUrl.value) return;
  if (!qrDataUrl.value) await makeQr(resultUrl.value);
  showQr.value = true;
  stopMainTimer();
  if (!unbindIdle) unbindIdle = bindIdleEvents();
}

function goHome() {
  if (unbindIdle) unbindIdle();
  unbindIdle = null;
  router.push("/");
}

function reset() {
  status.value = "idle";
  errorMsg.value = "";
  resultUrl.value = "";
  taskId.value = "";
  autoStarted.value = true;
  startGenerate();
}

function stopMainTimer() {
  clearInterval(timerId);
  timerId = null;
}

function startTimer() {
  stopMainTimer();
  timerId = setInterval(() => {
    timer.value -= 1;
    if (timer.value <= 0) {
      stopMainTimer();
      router.push("/");
    }
  }, 1000);
}

onMounted(() => {
  startTimer();
  if (!autoStarted.value) {
    autoStarted.value = true;
    startGenerate();
  }
});

onBeforeUnmount(() => {
  clearInterval(pollTimer);
  stopMainTimer();
  if (unbindIdle) unbindIdle();
  unbindIdle = null;
});
</script>

<style scoped>
.generate-page {
  align-items: center;
}

.result-panel {
  width: min(820px, 92vw);
  min-height: clamp(360px, 56vh, 860px);
  display: grid;
  place-items: center;
}

.result-wrap {
  width: 100%;
  display: grid;
  place-items: center;
}

.result-image {
  width: min(620px, 88vw);
  max-height: 64vh;
  object-fit: cover;
  border-radius: 20px;
  border: 2px solid rgba(80, 140, 210, 0.4);
  box-shadow: 0 22px 44px rgba(120, 140, 170, 0.28);
}

.result-placeholder {
  display: grid;
  place-items: center;
  gap: 14px;
  text-align: center;
}

.orb {
  width: clamp(110px, 18vh, 190px);
  height: clamp(110px, 18vh, 190px);
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 190, 190, 0.95), rgba(116, 182, 255, 0.6));
  box-shadow: 0 0 36px rgba(198, 37, 45, 0.2);
  animation: breathe 2.4s ease-in-out infinite;
}

.hint {
  color: #5a6675;
  font-size: clamp(16px, 1.8vh, 22px);
}

.action-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.error-msg {
  margin-top: 8px;
  color: #c6252d;
  text-align: center;
  font-size: clamp(14px, 1.6vh, 18px);
}

.qr-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
  z-index: 20;
}

.qr-card {
  width: min(440px, 86vw);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.7);
  display: grid;
  gap: 12px;
  justify-items: center;
  position: relative;
}

.qr-robot {
  position: absolute;
  top: -18px;
  left: 18px;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #5a8fff;
  color: #ffffff;
  font-weight: 800;
  display: grid;
  place-items: center;
  box-shadow: 0 8px 20px rgba(90, 143, 255, 0.35);
}

.qr-title {
  font-weight: 700;
  color: #2d2f33;
  font-size: clamp(18px, 2.2vh, 26px);
}

.qr-frame {
  width: min(280px, 60vw);
  aspect-ratio: 1 / 1;
  background: #f1f1f1;
  border-radius: 16px;
  border: 2px solid rgba(180, 180, 180, 0.7);
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
}

.qr-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 10px;
}

.qr-label {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: clamp(14px, 1.6vh, 18px);
  color: #5a6675;
}

.loading {
  color: #5a6675;
  font-size: clamp(14px, 1.6vh, 18px);
}

.qr-actions {
  display: grid;
  gap: 10px;
  width: 100%;
  justify-items: center;
}

.qr-cta {
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  background: linear-gradient(135deg, #cf2a32, #b81d27);
  color: #ffffff;
  font-weight: 700;
  text-align: center;
  box-shadow: 0 12px 26px rgba(207, 42, 50, 0.32);
  font-size: clamp(16px, 2vh, 24px);
}

.qr-countdown {
  position: absolute;
  top: 14px;
  right: 16px;
  text-align: right;
  color: #6b7482;
}

.countdown-label {
  font-size: clamp(12px, 1.3vh, 16px);
  letter-spacing: 0.5px;
}

.countdown-value {
  font-size: clamp(20px, 2.2vh, 28px);
  font-weight: 800;
  color: #c6252d;
}

@media (orientation: portrait) and (min-height: 2400px) {
  .result-panel {
    width: min(980px, 92vw);
    min-height: clamp(520px, 60vh, 1200px);
  }
  .result-image {
    width: min(760px, 90vw);
    max-height: 70vh;
  }
  .qr-card {
    width: min(520px, 86vw);
  }
  .qr-frame {
    width: min(320px, 60vw);
  }
  .countdown-value {
    font-size: clamp(22px, 2.4vh, 32px);
  }
}

@keyframes breathe {
  0%, 100% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
}
</style>

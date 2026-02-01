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
      <div class="result-wrap">
        <img v-if="status === 'success'" :src="resultUrl" class="result-image" alt="result" />
        <div v-else class="result-placeholder" :class="status">
          <div class="orb"></div>
          <div class="hint">
            {{ status === "error" ? "生成失败，请重试" : "AI 影像处理中" }}
          </div>
        </div>
      </div>
    </section>

    <div class="action-row">
      <button v-if="status === 'success'" class="btn btn-primary" @click="openQr">
        查看二维码
      </button>
      <button v-if="status === 'success'" class="btn btn-secondary" @click="goTemplates">
        重新选择模板
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
        <div class="qr-cta">扫描二维码获取电子版照片</div>
        <div class="qr-actions">
          <button class="btn btn-secondary qr-btn" type="button" @click="goHome">
            无操作{{ idleSeconds }}s后返回
          </button>
          <button class="btn btn-ghost qr-btn" type="button" @click="goHome">
            返回首页
          </button>
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

const totalSeconds = 180;
const timer = ref(totalSeconds);
let timerId = null;

const IDLE_MS = 90 * 1000;
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
    width: 800,
    margin: 2,
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

function goTemplates() {
  if (unbindIdle) unbindIdle();
  unbindIdle = null;
  const themeId = sessionStorage.getItem("themeId") || "";
  router.push({ path: "/templates", query: { themeId, reuse: "1" } });
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
  align-items: stretch;
  width: calc(var(--vw) * 100);
  max-width: calc(var(--vw) * 100);
  height: calc(var(--vh) * 100);
  padding: 0;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: clamp(22px, calc(var(--vh) * 3.4), 44px);
  justify-items: stretch;
}

.generate-page .page-top {
  width: 100%;
  max-width: 100%;
  padding-top: clamp(52px, calc(var(--vh) * 7.8), 110px);
  padding-inline: clamp(24px, calc(var(--vh) * 3.2), 48px);
}

.generate-page .page-title-cn {
  font-size: clamp(68px, calc(var(--vh) * 8.4), 120px);
}

.generate-page .page-title-en {
  font-size: clamp(28px, calc(var(--vh) * 3.4), 44px);
  letter-spacing: 2px;
}

.generate-page .page-timer {
  font-size: clamp(40px, calc(var(--vh) * 5.2), 72px);
}

.result-panel {
  width: 100%;
  max-width: 100%;
  height: auto;
  min-height: clamp(640px, calc(var(--vh) * 62), 1440px);
  display: grid;
  place-items: center;
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0 clamp(28px, calc(var(--vh) * 3.6), 60px);
}

.result-wrap {
  width: 100%;
  height: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 28px;
  overflow: hidden;
  background: #f1f6ff;
  border: 3px solid #4aa4ff;
  box-shadow: 0 18px 36px rgba(80, 140, 210, 0.25);
  display: grid;
  place-items: center;
}

.result-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-placeholder {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  gap: clamp(16px, calc(var(--vh) * 2.4), 32px);
  text-align: center;
}

.orb {
  width: clamp(440px, calc(var(--vh) * 52), 840px);
  height: clamp(440px, calc(var(--vh) * 52), 840px);
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 190, 190, 0.95), rgba(116, 182, 255, 0.6));
  box-shadow: 0 0 36px rgba(198, 37, 45, 0.2);
  animation: breathe 2.4s ease-in-out infinite;
}

.hint {
  color: #5a6675;
  font-weight: 700;
  font-size: clamp(42px, calc(var(--vh) * 5.4), 84px);
}

.action-row {
  display: flex;
  gap: clamp(16px, calc(var(--vh) * 2.4), 28px);
  flex-wrap: wrap;
  justify-content: center;
  padding-inline: clamp(24px, calc(var(--vh) * 3.2), 48px);
  position: sticky;
  bottom: 0;
  background: linear-gradient(180deg, rgba(251, 219, 209, 0), rgba(251, 219, 209, 0.92) 40%, rgba(251, 219, 209, 0.98) 100%);
  padding-bottom: clamp(16px, calc(var(--vh) * 2.4), 32px);
}

.action-row .btn {
  min-height: clamp(90px, calc(var(--vh) * 10), 140px);
  font-size: clamp(50px, calc(var(--vh) * 6.5), 80px);
}

.error-msg {
  margin-top: 4px;
  padding-inline: clamp(24px, calc(var(--vh) * 3.2), 48px);
  color: #c6252d;
  text-align: center;
  font-size: clamp(32px, calc(var(--vh) * 4.2), 56px);
}

.qr-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  z-index: 20;
  backdrop-filter: blur(2px);
}

.qr-card {
  width: min(1200px, calc(var(--vw) * 90));
  background: rgba(255, 255, 255, 0.96);
  border-radius: 28px;
  padding: clamp(36px, calc(var(--vh) * 4.6), 64px) clamp(32px, calc(var(--vh) * 4.2), 58px);
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.22);
  border: 2px solid rgba(255, 255, 255, 0.7);
  display: grid;
  gap: clamp(16px, calc(var(--vh) * 2.6), 36px);
  justify-items: center;
  position: relative;
}

.qr-robot {
  position: absolute;
  top: clamp(-18px, calc(var(--vh) * -2), -10px);
  left: clamp(18px, calc(var(--vh) * 2.4), 32px);
  width: clamp(70px, calc(var(--vh) * 8.6), 120px);
  height: clamp(70px, calc(var(--vh) * 8.6), 120px);
  border-radius: clamp(20px, calc(var(--vh) * 2.6), 36px);
  background: linear-gradient(135deg, #65a0ff, #4e7bff);
  color: #ffffff;
  font-weight: 800;
  display: grid;
  place-items: center;
  box-shadow: 0 8px 20px rgba(90, 143, 255, 0.35);
  font-size: clamp(28px, calc(var(--vh) * 3.6), 48px);
}

.qr-title {
  font-weight: 700;
  color: #2d2f33;
  font-size: clamp(48px, calc(var(--vh) * 6), 82px);
}

.qr-frame {
  width: min(760px, calc(var(--vw) * 72));
  aspect-ratio: 1 / 1;
  background: #f1f1f1;
  border-radius: 24px;
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
  padding: clamp(16px, calc(var(--vh) * 2.4), 32px);
}

.qr-label {
  position: absolute;
  bottom: clamp(14px, calc(var(--vh) * 2), 24px);
  left: 50%;
  transform: translateX(-50%);
  font-size: clamp(32px, calc(var(--vh) * 4), 56px);
  color: #5a6675;
}

.loading {
  color: #5a6675;
  font-size: clamp(32px, calc(var(--vh) * 4), 56px);
}

.qr-cta {
  width: 100%;
  padding: clamp(18px, calc(var(--vh) * 2.8), 36px) clamp(20px, calc(var(--vh) * 3.2), 48px);
  border-radius: 16px;
  background: linear-gradient(135deg, #cf2a32, #b81d27);
  color: #ffffff;
  font-weight: 700;
  text-align: center;
  box-shadow: 0 12px 26px rgba(207, 42, 50, 0.32);
  font-size: clamp(42px, calc(var(--vh) * 5.4), 76px);
}

.qr-actions {
  display: grid;
  gap: clamp(14px, calc(var(--vh) * 2.2), 30px);
  width: 100%;
}

.qr-btn {
  width: 100%;
  font-size: clamp(50px, calc(var(--vh) * 6.5), 80px);
  padding-block: clamp(20px, calc(var(--vh) * 3.2), 40px);
}
@keyframes breathe {
  0%, 100% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
}
</style>

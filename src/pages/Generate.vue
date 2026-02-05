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

    <section class="panel result-panel" :class="{ 'is-loading': status === 'idle' || status === 'generating' }">
      <div class="result-wrap">
        <img v-if="status === 'success'" :src="resultUrl" class="result-image" alt="result" />
        <div v-else class="result-placeholder" :class="status">
          <div v-if="status === 'error'" class="gen-error">
            <div class="hint">生成失败，请重试</div>
          </div>
          <div v-else class="gen-loading">
            <div class="gen-title" aria-hidden="true">
              <div class="gen-title-main">PHOTO GENERATION</div>
              <div class="gen-title-sub">COUNTDOWN</div>
            </div>

            <FlipCounter class="gen-flip" :value="flipValue" :digits="2" />

            <img class="gen-processing" :src="generateProcessingUrl" alt="照片生成中" />
            <img class="gen-logo" :src="generateLogoUrl" alt="Jinshan Cultural Expo Park" />
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

    <div v-if="showQr" class="qr-overlay" role="dialog" aria-modal="true">
      <div class="qr-modal">
        <button class="qr-close" type="button" @click="closeQr" aria-label="关闭">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <img class="qr-frame-bg" :src="qrFrameUrl" alt="" aria-hidden="true" />
        <div class="qr-slot" aria-label="二维码">
          <img v-if="qrDataUrl" :src="qrDataUrl" class="qr-img" alt="二维码" />
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
import FlipCounter from "@/components/FlipCounter.vue";

const router = useRouter();

const status = ref("idle");
const errorMsg = ref("");
const resultUrl = ref("");
const taskId = ref("");
const autoStarted = ref(false);
let pollTimer = null;
let perfT0 = null;
let perfT1 = null;
let perfT2 = null;

const showQr = ref(false);
const qrDataUrl = ref("");

const imageBase64 = sessionStorage.getItem("imageBase64");
const styleId = sessionStorage.getItem("styleId") || "default";

const baseUrl = import.meta.env.BASE_URL;
const generateLogoUrl = `${baseUrl}generate/generate-logo.webp`;
const generateProcessingUrl = `${baseUrl}generate/generate-processing.webp`;
const qrFrameUrl = `${baseUrl}qrcode/qr-frame-a.webp`;

const totalSeconds = 180;
const timer = ref(totalSeconds);
let timerId = null;

const elapsedSec = ref(0);
let elapsedTimerId = null;
const flipValue = computed(() => elapsedSec.value % 100);

const IDLE_MS = 90 * 1000;
const idleSeconds = ref(Math.floor(IDLE_MS / 1000));
let idleTimer = null;
let countdownTimer = null;
let lastActiveAt = Date.now();
let unbindIdle = null;

const timerText = computed(() => `${timer.value}s`);

function resetPerf() {
  perfT0 = null;
  perfT1 = null;
  perfT2 = null;
}

function toSeconds(ms) {
  return (ms / 1000).toFixed(1);
}

function parseHeaderMs(resp, name) {
  const v = resp.headers.get(name);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function stopElapsed() {
  if (elapsedTimerId) {
    clearInterval(elapsedTimerId);
    elapsedTimerId = null;
  }
}

function startElapsed() {
  stopElapsed();
  elapsedSec.value = 0;
  elapsedTimerId = setInterval(() => {
    elapsedSec.value += 1;
  }, 1000);
}

async function startGenerate() {
  if (!imageBase64) {
    status.value = "error";
    errorMsg.value = "未获取到照片数据";
    return;
  }

  status.value = "generating";
  startElapsed();
  resetPerf();
  perfT0 = performance.now();

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
    perfT1 = performance.now();
    console.log(`[perf] generate=${toSeconds(perfT1 - perfT0)}s`);

    const tBody = parseHeaderMs(resp, "X-Perf-Body-Parse");
    const tProvider = parseHeaderMs(resp, "X-Perf-Provider");
    const tTotal = parseHeaderMs(resp, "X-Perf-Total");
    if (tTotal !== null) {
      const netApprox = Math.max(0, perfT1 - perfT0 - tTotal);
      console.log(
        `[perf] server body_parse=${toSeconds(tBody || 0)}s provider=${toSeconds(
          tProvider || 0
        )}s total=${toSeconds(tTotal)}s`
      );
      console.log(`[perf] network+upload≈${toSeconds(netApprox)}s`);
    }
    if (!resp.ok || !data.taskId) {
      throw new Error(data.error || "生成任务创建失败");
    }

    taskId.value = data.taskId;
    pollTask();
  } catch (err) {
    stopElapsed();
    if (perfT0) {
      const tEnd = performance.now();
      console.log(`[perf] generate=${toSeconds(tEnd - perfT0)}s`);
    }
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
        stopElapsed();
        perfT2 = performance.now();
        if (perfT1 && perfT0) {
          console.log(
            `[perf] poll=${toSeconds(perfT2 - perfT1)}s total=${toSeconds(
              perfT2 - perfT0
            )}s`
          );
        }
        clearInterval(pollTimer);
      } else if (data.status === "FAILED") {
        throw new Error(data.error || "生成失败");
      }
    } catch (err) {
      stopElapsed();
      if (perfT1) {
        const tEnd = performance.now();
        console.log(`[perf] poll=${toSeconds(tEnd - perfT1)}s`);
      }
      status.value = "error";
      errorMsg.value = err.message || "轮询失败";
      clearInterval(pollTimer);
    }
  }, AI_CONFIG.POLL_INTERVAL);
}

async function makeQr(url) {
  qrDataUrl.value = await QRCode.toDataURL(url, {
    width: 420,
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
  if (!unbindIdle) unbindIdle = bindIdleEvents();
}

function closeQr() {
  showQr.value = false;
  if (unbindIdle) unbindIdle();
  unbindIdle = null;
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
  resetPerf();
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
  stopElapsed();
  if (unbindIdle) unbindIdle();
  unbindIdle = null;
});
</script>

<style scoped>
.generate-page {
  position: absolute;
  inset: 0;
  width: 2160px;
  height: 3840px;
  padding: 0;
  display: block;
  overflow: hidden;
  background: url("/template-bg.webp") center / cover no-repeat;
  background-color: #ffffff;
}

.generate-page .page-top {
  position: absolute;
  top: 278px;
  left: 0;
  width: 2160px;
  height: 220px;
  padding: 0;
  display: block;
  z-index: 6;
}

.generate-page .page-top .home-btn {
  position: absolute;
  top: 0;
  left: 0;
  width: 220px;
  height: 220px;
  border-radius: 0 200px 200px 0;
  box-shadow: none;
  background: #ba1313;
  border: none;
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
}

.generate-page .page-top .home-btn svg {
  width: 100px;
  height: 100px;
  fill: #ffffff;
}

.generate-page .page-top > div:not(.page-timer) {
  position: absolute;
  top: 0;
  left: 362px;
  width: 1116px;
  height: 219px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0;
}

.generate-page .page-timer {
  position: absolute;
  top: 0;
  left: 1788px;
  width: 165px;
  height: 137px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Alibaba PuHuiTi", "PingFang SC", "Microsoft YaHei", sans-serif;
  font-weight: 700;
  color: #333333;
}

.generate-page .page-title-cn {
  font-size: 100px;
}

.generate-page .page-title-en {
  font-size: 60px;
  letter-spacing: 0;
}

.generate-page .page-timer {
  font-size: 100px;
}

.result-panel {
  all: unset;
  position: absolute;
  top: 624px;
  left: 360px;
  width: 1437px;
  height: 1879px;
  display: block;
  border-radius: 40px;
  z-index: 1;
}

.result-panel.is-loading {
  top: 0;
  left: 0;
  width: 2160px;
  height: 3840px;
  border-radius: 0;
}

.result-wrap {
  width: 1437px;
  height: 1879px;
  border-radius: 40px;
  overflow: hidden;
  display: grid;
  place-items: center;
  background:
    radial-gradient(980px 980px at 18% 24%, rgba(170, 222, 255, 0.55), transparent 66%),
    radial-gradient(980px 980px at 82% 20%, rgba(255, 222, 196, 0.55), transparent 66%),
    radial-gradient(1100px 1100px at 78% 86%, rgba(255, 206, 231, 0.45), transparent 66%),
    linear-gradient(140deg, rgba(247, 250, 255, 0.95), rgba(255, 248, 241, 0.95) 55%, rgba(255, 248, 255, 0.97));
}

.result-panel.is-loading .result-wrap {
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.result-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-placeholder {
  width: 100%;
  height: 100%;
  text-align: center;
}

.gen-loading {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 760px 80px 120px;
  gap: 56px;
}

.gen-title {
  display: grid;
  gap: 10px;
}

.gen-title-main {
  font-weight: 900;
  font-size: 104px;
  color: rgba(45, 47, 51, 0.86);
  letter-spacing: 1px;
}

.gen-title-sub {
  font-weight: 900;
  font-size: 76px;
  color: rgba(45, 47, 51, 0.76);
  letter-spacing: 1px;
}

.gen-flip {
  --flip-digit-w: 420px;
  --flip-digit-h: 580px;
  --flip-gap: 96px;
}

.gen-processing {
  width: 372px;
  height: auto;
  margin-top: 8px;
  opacity: 0.92;
}

.gen-logo {
  width: 440px;
  height: auto;
  opacity: 0.9;
  margin-top: auto;
}

.gen-error {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}

.hint {
  color: #5a6675;
  font-weight: 700;
  font-size: 84px;
}

.action-row {
  position: absolute;
  top: 3308px;
  left: 0;
  width: 2160px;
  height: 136px;
  display: flex;
  justify-content: center;
  gap: 80px;
  padding: 0;
}

.action-row .btn {
  width: 440px;
  height: 136px;
  font-size: 56px;
}

.error-msg {
  position: absolute;
  top: 3490px;
  left: 0;
  width: 2160px;
  padding: 0 48px;
  color: #c6252d;
  text-align: center;
  font-size: 56px;
}

.qr-overlay {
  position: fixed;
  inset: 0;
  background: transparent;
  z-index: 20;
}

.qr-modal {
  width: 566px;
  height: 776px;
  position: absolute;
  left: 50%;
  top: 1176px;
  transform: translateX(calc(-50% - 1px));
}

.qr-close {
  position: absolute;
  top: -24px;
  right: -24px;
  z-index: 2;
  width: 88px;
  height: 88px;
  border-radius: 999px;
  border: 1.5px solid rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.92);
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
  transition: transform 160ms ease, background-color 160ms ease;
}

.qr-close:active {
  transform: scale(0.98);
}

.qr-close svg {
  width: 44px;
  height: 44px;
  fill: none;
  stroke: #333333;
  stroke-width: 3.2px;
  stroke-linecap: round;
}

.qr-frame-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
}

.qr-slot {
  position: absolute;
  left: 18px;
  top: 24px;
  width: 530px;
  height: 530px;
  padding: 55px;
  box-sizing: border-box;
  display: grid;
  place-items: center;
}

.qr-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>

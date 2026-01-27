<template>
  <div class="app-page camera-page">
    <header class="page-top">
      <button class="home-btn" type="button" @click="goHome" aria-label="home">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4.2 3 11.4v7.4a1 1 0 0 0 1 1h5.2v-5.6h5.6v5.6H20a1 1 0 0 0 1-1v-7.4l-9-7.2Z" />
        </svg>
      </button>
      <div>
        <div class="page-title-cn">开始拍摄</div>
        <div class="page-title-en">START SHOOTING</div>
      </div>
      <div class="page-timer">{{ timerText }}</div>
    </header>

    <div class="check-row">
      <div v-for="item in checks" :key="item.label" class="check-item">
        <div class="check-thumb">
          <img :src="item.image" :alt="item.label" />
        </div>
        <div class="check-text">{{ item.label }}</div>
        <div class="check-status" :class="item.ok ? 'ok' : 'no'">
          <span>{{ item.ok ? "✓" : "×" }}</span>
        </div>
      </div>
    </div>

    <section class="stage">
      <video
        ref="videoEl"
        class="video"
        autoplay
        playsinline
        muted
        v-show="!photoDataUrl"
      ></video>

      <img
        v-if="photoDataUrl"
        class="photo overlay"
        :src="photoDataUrl"
        alt="photo"
      />

      <div v-if="countdown > 0" class="countdown">
        {{ countdown }}
      </div>

      <div v-if="errorMsg" class="error">
        <div class="errTitle">摄像头不可用</div>
        <div class="errDesc">{{ errorMsg }}</div>
        <button class="btn btn-secondary" @click="initCamera">重试</button>
      </div>
    </section>

    <div class="tip-row">
      <span class="tip-badge">温馨提示</span>
      <span class="tip-text">拍摄时，请不要晃动手机和眼镜，拍摄效果越好哦</span>
    </div>

    <div class="action-row">
      <button class="btn btn-ghost" @click="goBack">返回</button>
      <button class="btn btn-secondary" @click="retake" :disabled="busy">
        重新拍摄
      </button>
      <button class="btn btn-primary" @click="confirm" :disabled="busy || !photoDataUrl">
        点击确认
      </button>
    </div>

    <canvas ref="canvasEl" class="hidden"></canvas>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import check1 from "../assets/steps/check-1.webp";
import check2 from "../assets/steps/check-2.webp";
import check3 from "../assets/steps/check-3.webp";
import check4 from "../assets/effects/check-4.webp";
const router = useRouter();
const route = useRoute();

const videoEl = ref(null);
const canvasEl = ref(null);
const stream = ref(null);
const errorMsg = ref("");

const countdown = ref(0);
const busy = ref(false);
const photoDataUrl = ref("");

const themeId = ref("");
const templateId = ref("");
const delaySec = ref(3);

const timer = ref(50);
let timerId = null;

const checks = [
  { label: "五官清晰", ok: true, image: check1 },
  { label: "正确镜头", ok: false, image: check2 },
  { label: "面无遮挡", ok: false, image: check3 },
  { label: "光线充足", ok: false, image: check4 },
];

const styleId = computed(() => {
  if (themeId.value && templateId.value) return `${themeId.value}_${templateId.value}`;
  return themeId.value || templateId.value || "default";
});

const timerText = computed(() => `${timer.value}s`);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function ensureVideoReady(video) {
  if (!video) return;
  if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) return;

  await new Promise((resolve) => {
    const onReady = () => {
      if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        video.removeEventListener("loadedmetadata", onReady);
        video.removeEventListener("canplay", onReady);
        resolve();
      }
    };
    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("canplay", onReady);
  });
}

async function initCamera() {
  errorMsg.value = "";
  stopCamera();

  try {
    const s = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });

    stream.value = s;

    if (videoEl.value) {
      videoEl.value.srcObject = s;
      await videoEl.value.play();
      await ensureVideoReady(videoEl.value);
    }

    await beginShoot();
  } catch (e) {
    errorMsg.value =
      "请允许浏览器使用摄像头权限。若不在 localhost/https 下运行，浏览器可能阻止摄像头。错误信息：" +
      (e?.message || String(e));
  }
}

function stopCamera() {
  if (stream.value) {
    stream.value.getTracks().forEach((t) => t.stop());
    stream.value = null;
  }
}

async function capturePhoto() {
  if (!videoEl.value || !canvasEl.value || !stream.value) return;

  busy.value = true;
  try {
    if (delaySec.value > 0) {
      countdown.value = delaySec.value;
      while (countdown.value > 0) {
        await sleep(1000);
        countdown.value -= 1;
      }
    }

    const video = videoEl.value;
    const canvas = canvasEl.value;

    await ensureVideoReady(video);

    const w = video.videoWidth;
    const h = video.videoHeight;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);

    photoDataUrl.value = canvas.toDataURL("image/jpeg", 0.92);
  } finally {
    busy.value = false;
    countdown.value = 0;
  }
}

async function beginShoot() {
  photoDataUrl.value = "";
  await capturePhoto();
}

function retake() {
  if (busy.value) return;
  beginShoot();
}

function confirm() {
  sessionStorage.setItem("styleId", styleId.value);
  sessionStorage.setItem("imageBase64", photoDataUrl.value);
  sessionStorage.setItem("artcam_styleId", styleId.value);
  sessionStorage.setItem("artcam_photo", photoDataUrl.value);

  stopCamera();
  router.push("/generate");
}

function goHome() {
  stopCamera();
  router.push("/");
}

function goBack() {
  stopCamera();
  router.push({ path: "/mode", query: { themeId: themeId.value, templateId: templateId.value } });
}

function startTimer() {
  clearInterval(timerId);
  timerId = setInterval(() => {
    timer.value -= 1;
    if (timer.value <= 0) {
      clearInterval(timerId);
      goHome();
    }
  }, 1000);
}

onMounted(() => {
  themeId.value = route.query.themeId?.toString() || sessionStorage.getItem("themeId") || "";
  templateId.value =
    route.query.templateId?.toString() || sessionStorage.getItem("templateId") || "";

  if (themeId.value) sessionStorage.setItem("themeId", themeId.value);
  if (templateId.value) sessionStorage.setItem("templateId", templateId.value);

  const delayFromRoute = Number(route.query.delay);
  const delayFromStorage = Number(sessionStorage.getItem("photoDelaySec"));
  if (!Number.isNaN(delayFromRoute)) {
    delaySec.value = delayFromRoute;
  } else if (!Number.isNaN(delayFromStorage)) {
    delaySec.value = delayFromStorage;
  }

  startTimer();
  initCamera();
});

onBeforeUnmount(() => {
  stopCamera();
  clearInterval(timerId);
});
</script>

<style scoped>
.camera-page {
  color: var(--text);
  gap: clamp(24px, 3.4vh, 48px);
}

.camera-page .page-top {
  padding-top: clamp(52px, 7.8vh, 110px);
  padding-inline: clamp(24px, 3.2vh, 48px);
}

.camera-page .page-title-cn {
  font-size: clamp(68px, 8.4vh, 120px);
}

.camera-page .page-title-en {
  font-size: clamp(28px, 3.4vh, 44px);
  letter-spacing: 2px;
}

.camera-page .page-timer {
  font-size: clamp(40px, 5.2vh, 72px);
}

.check-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(18px, 2.6vh, 32px);
  margin-top: clamp(8px, 1.6vh, 20px);
  padding-inline: clamp(24px, 3.2vh, 48px);
}

.check-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(10px, 1.8vh, 18px);
  font-size: clamp(26px, 3.2vh, 46px);
  color: #4b4f57;
}

.check-thumb {
  width: clamp(120px, 14vh, 200px);
  height: clamp(120px, 14vh, 200px);
  border-radius: 18px;
  overflow: hidden;
  border: 2px solid rgba(198, 37, 45, 0.75);
  background: #ffffff;
  box-shadow: 0 12px 22px rgba(120, 140, 170, 0.18);
}

.check-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.check-text {
  font-weight: 600;
  color: #3f434b;
}

.check-status {
  width: clamp(36px, 4.2vh, 60px);
  height: clamp(36px, 4.2vh, 60px);
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: clamp(22px, 3vh, 36px);
  font-weight: 800;
  color: #ffffff;
  background: #c6252d;
  box-shadow: 0 8px 16px rgba(198, 37, 45, 0.3);
}

.check-status.ok {
  background: #c6252d;
}

.check-status.no {
  background: #c6252d;
}

.stage {
  position: relative;
  border-radius: 28px;
  overflow: hidden;
  background: #f1f6ff;
  border: 3px solid #4aa4ff;
  aspect-ratio: 3 / 4;
  min-height: clamp(520px, 58vh, 1280px);
  box-shadow: 0 18px 36px rgba(80, 140, 210, 0.25);
}

.video,
.photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.overlay {
  z-index: 2;
}

.countdown {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: grid;
  place-items: center;
  font-size: clamp(90px, 12vh, 180px);
  font-weight: 800;
  background: rgba(255, 255, 255, 0.65);
  color: #c6252d;
}

.error {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: grid;
  place-items: center;
  padding: 18px;
  text-align: center;
  background: rgba(255, 255, 255, 0.75);
}

.errTitle {
  font-size: clamp(32px, 4.2vh, 56px);
  font-weight: 700;
}

.errDesc {
  margin-top: 8px;
  font-size: clamp(22px, 3vh, 38px);
  color: var(--muted);
}

.tip-row {
  display: flex;
  align-items: center;
  gap: clamp(12px, 1.8vh, 20px);
  font-size: clamp(28px, 3.6vh, 50px);
  color: #c6252d;
  padding-inline: clamp(24px, 3.2vh, 48px);
}

.tip-badge {
  padding: 8px 18px;
  border-radius: 999px;
  background: #c6252d;
  color: #ffffff;
  font-weight: 700;
  font-size: clamp(22px, 2.8vh, 36px);
}

.tip-text {
  color: #c6252d;
  font-weight: 600;
}

.action-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(16px, 2.4vh, 28px);
  padding-inline: clamp(24px, 3.2vh, 48px);
}

.action-row .btn {
  min-height: clamp(90px, 10vh, 140px);
  font-size: clamp(50px, 6.5vh, 80px);
}

.hidden {
  display: none;
}

@media (max-width: 720px) {
  .check-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .action-row {
    grid-template-columns: 1fr;
  }
}

@media (orientation: portrait) and (min-height: 2400px) {
  .check-thumb {
    width: clamp(140px, 14vh, 220px);
    height: clamp(140px, 14vh, 220px);
  }
  .stage {
    min-height: clamp(640px, 62vh, 1440px);
  }
  .action-row {
    gap: 24px;
  }
}
</style>

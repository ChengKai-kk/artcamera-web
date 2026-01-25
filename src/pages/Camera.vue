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
        <div class="check-icon" :class="item.ok ? 'ok' : 'no'">
          <span>{{ item.ok ? "✓" : "×" }}</span>
        </div>
        <div class="check-text">{{ item.label }}</div>
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
  { label: "五官清晰", ok: true },
  { label: "正确镜头", ok: false },
  { label: "面无遮挡", ok: false },
  { label: "光线充足", ok: false },
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
}

.check-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 6px;
}

.check-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: clamp(14px, 1.7vh, 20px);
  color: #5a6675;
}

.check-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 24px;
  font-weight: 800;
}

.check-icon.ok {
  background: #d6f6e6;
  color: #1b8b56;
}

.check-icon.no {
  background: #ffd4d4;
  color: #c02d2d;
}

.stage {
  position: relative;
  border-radius: 22px;
  overflow: hidden;
  background: #f1f6ff;
  border: 3px solid #4aa4ff;
  aspect-ratio: 3 / 4;
  min-height: clamp(360px, 52vh, 920px);
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
  font-size: clamp(72px, 11vh, 140px);
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
  font-size: clamp(20px, 2.4vh, 32px);
  font-weight: 700;
}

.errDesc {
  margin-top: 8px;
  font-size: clamp(14px, 1.6vh, 18px);
  color: var(--muted);
}

.tip-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: clamp(15px, 1.8vh, 22px);
  color: #c6252d;
}

.tip-badge {
  padding: 4px 10px;
  border-radius: 999px;
  background: #c6252d;
  color: #ffffff;
  font-weight: 700;
  font-size: 15px;
}

.tip-text {
  color: #c6252d;
  font-weight: 600;
}

.action-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
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
  .check-icon {
    width: 64px;
    height: 64px;
    font-size: 26px;
  }
  .stage {
    min-height: clamp(520px, 60vh, 1280px);
  }
  .action-row {
    gap: 20px;
  }
}
</style>

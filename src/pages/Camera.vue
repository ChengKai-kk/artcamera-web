<template>
  <div class="app-page camera-page">
    <div class="camera-bg" aria-hidden="true"></div>

    <button
      class="camera-home-hit"
      type="button"
      @click="goHome"
      aria-label="home"
    ></button>

    <img class="camera-title" :src="cameraTitle" alt="开始拍摄 Start shooting" />
    <img class="camera-note" :src="cameraNote" alt="" aria-hidden="true" />
    <div class="camera-timer" aria-live="polite">{{ timerText }}</div>

    <section class="camera-media">
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


    <button class="camera-btn camera-btn-back" @click="goBack" aria-label="返回">
      <img :src="cameraBack" alt="" aria-hidden="true" />
    </button>
    <button
      class="camera-btn camera-btn-retake"
      @click="retake"
      :disabled="busy"
      aria-label="重新拍摄"
    >
      <img :src="cameraRetake" alt="" aria-hidden="true" />
    </button>
    <button
      class="camera-btn camera-btn-confirm"
      @click="confirm"
      :disabled="busy || !photoDataUrl"
      aria-label="点击确认"
    >
      <img :src="cameraConfirm" alt="" aria-hidden="true" />
    </button>

    <canvas ref="canvasEl" class="hidden"></canvas>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import cameraTitle from "../assets/camera/camera-title.webp";
import cameraNote from "../assets/camera/camera-note.webp";
import cameraBack from "../assets/camera/camera-back.webp";
import cameraRetake from "../assets/camera/camera-retake.webp";
import cameraConfirm from "../assets/camera/camera-confirm.webp";
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

const styleId = computed(() => {
  if (themeId.value && templateId.value) return `${themeId.value}_${templateId.value}`;
  return themeId.value || templateId.value || "default";
});

const timerText = computed(() => `${timer.value}s`);

function getDataUrlMime(dataUrl) {
  const s = String(dataUrl || "");
  const m = s.match(/^data:([^;]+);base64,/);
  return m ? m[1] : "";
}

function base64ByteLength(b64) {
  const s = String(b64 || "").replace(/[\r\n\s]/g, "");
  if (!s) return 0;
  const pad = s.endsWith("==") ? 2 : s.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((s.length * 3) / 4) - pad);
}

function dataUrlByteLength(dataUrl) {
  const s = String(dataUrl || "");
  const comma = s.indexOf(",");
  if (comma < 0) return 0;
  return base64ByteLength(s.slice(comma + 1));
}

function formatBytes(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return "0B";
  const units = ["B", "KB", "MB", "GB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  const digits = i === 0 ? 0 : v < 10 ? 2 : v < 100 ? 1 : 0;
  return `${v.toFixed(digits)}${units[i]}`;
}

function savePhotoMeta({ captureW, captureH, uploadW, uploadH, uploadMime, uploadBytes, rawBytes }) {
  const meta = {
    capture: { w: captureW, h: captureH },
    upload: { w: uploadW, h: uploadH, mime: uploadMime, bytes: uploadBytes },
  };
  if (typeof rawBytes === "number") {
    meta.raw = { mime: "image/jpeg", quality: 0.92, bytes: rawBytes };
  }
  sessionStorage.setItem("artcam_photo_meta", JSON.stringify(meta));

  if (typeof rawBytes === "number") {
    console.log(
      `[photo] 拍照=${captureW}x${captureH} 原始=JPEG(0.92) ${formatBytes(
        rawBytes
      )} 压缩后=${uploadMime} ${formatBytes(uploadBytes)}`
    );
  } else {
    console.log(
      `[photo] 拍照=${captureW}x${captureH} 压缩后=${uploadMime} ${formatBytes(uploadBytes)}`
    );
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      type,
      quality
    );
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result || "");
    reader.readAsDataURL(blob);
  });
}

async function compressCanvasToTarget(canvas, targetBytes) {
  const mime = "image/jpeg";
  const qualityStart = 0.8;
  const minQuality = 0.5;
  const minLongEdge = 720;
  const maxSteps = 12;

  let curCanvas = canvas;
  let quality = qualityStart;
  let blob = null;

  for (let step = 0; step < maxSteps; step += 1) {
    blob = await canvasToBlob(curCanvas, mime, quality);
    const size = blob ? blob.size : 0;
    if (size > 0 && size <= targetBytes) {
      const dataUrl = await blobToDataUrl(blob);
      return {
        dataUrl,
        bytes: size,
        mime,
        quality,
        w: curCanvas.width,
        h: curCanvas.height,
      };
    }

    if (quality > minQuality) {
      quality = Math.max(minQuality, quality - 0.1);
      continue;
    }

    const longEdge = Math.max(curCanvas.width, curCanvas.height);
    if (longEdge <= minLongEdge) {
      break;
    }

    const scale = Math.max(minLongEdge / longEdge, 0.85);
    const nextW = Math.max(1, Math.round(curCanvas.width * scale));
    const nextH = Math.max(1, Math.round(curCanvas.height * scale));
    const resized = document.createElement("canvas");
    resized.width = nextW;
    resized.height = nextH;
    const rctx = resized.getContext("2d");
    rctx.drawImage(curCanvas, 0, 0, nextW, nextH);
    curCanvas = resized;
    quality = qualityStart;
  }

  if (!blob) {
    blob = await canvasToBlob(curCanvas, mime, quality);
  }
  const dataUrl = blob ? await blobToDataUrl(blob) : "";
  return {
    dataUrl,
    bytes: blob ? blob.size : 0,
    mime,
    quality,
    w: curCanvas.width,
    h: curCanvas.height,
  };
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

    // Baseline (before compression): JPEG 0.92
    const rawBlob = await canvasToBlob(canvas, "image/jpeg", 0.92);
    const rawBytes = rawBlob ? rawBlob.size : 0;

    // Upload (after compression): target <= 300KB, allow quality and size reduction.
    const targetBytes = 300 * 1024;
    const out = await compressCanvasToTarget(canvas, targetBytes);
    photoDataUrl.value = out.dataUrl;

    savePhotoMeta({
      captureW: w,
      captureH: h,
      uploadW: out.w,
      uploadH: out.h,
      uploadMime: out.mime,
      uploadBytes: out.bytes,
      rawBytes,
    });
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
  width: var(--design-width);
  height: var(--design-height);
  padding: 0;
  margin: 0;
  display: block;
  color: #333333;
  position: relative;
  overflow: hidden;
}

.camera-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(1200px 1200px at 14% 18%, rgba(255, 214, 201, 0.9), transparent 68%),
    radial-gradient(1400px 1400px at 88% 22%, rgba(255, 234, 223, 0.9), transparent 72%),
    radial-gradient(1600px 1600px at 72% 78%, rgba(252, 209, 198, 0.7), transparent 70%),
    linear-gradient(135deg, #f7cfc2 0%, #f8d9cf 40%, #f3c2b6 100%);
  z-index: 0;
  pointer-events: none;
}

.camera-title {
  position: absolute;
  top: 278px;
  left: 362px;
  width: 1116px;
  height: 219px;
  z-index: 2;
  pointer-events: none;
}

.camera-note {
  position: absolute;
  top: 590px;
  left: 362px;
  width: 1436px;
  height: 468px;
  z-index: 2;
  pointer-events: none;
}

.camera-timer {
  position: absolute;
  top: 278px;
  left: 1788px;
  width: 165px;
  height: 137px;
  font-size: 100px;
  font-weight: 700;
  font-family: "Alibaba PuHuiTi", "PingFang SC", "Microsoft YaHei", sans-serif;
  color: #333333;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}


.camera-home-hit {
  position: absolute;
  top: 278px;
  left: 0;
  width: 220px;
  height: 220px;
  border-radius: 999px;
  background: transparent;
  border: none;
  z-index: 4;
  cursor: pointer;
}

.camera-media {
  position: absolute;
  top: 1152px;
  left: 360px;
  width: 1437px;
  height: 1803px;
  border-radius: 40px;
  overflow: hidden;
  background: #000000;
  z-index: 3;
  -webkit-mask-image: url("../assets/camera/camera-mask.webp");
  -webkit-mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-image: url("../assets/camera/camera-mask.webp");
  mask-size: 100% 100%;
  mask-repeat: no-repeat;
  mask-position: center;
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
  font-size: 180px;
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
  font-size: 56px;
  font-weight: 700;
}

.errDesc {
  margin-top: 8px;
  font-size: 38px;
  color: var(--muted);
}

.camera-btn {
  position: absolute;
  top: 3308px;
  width: 440px;
  height: 136px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  z-index: 4;
}

.camera-btn img {
  width: 100%;
  height: 100%;
  display: block;
}

.camera-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.camera-btn-back {
  left: 340px;
}

.camera-btn-retake {
  left: 860px;
}

.camera-btn-confirm {
  left: 1380px;
}

.hidden {
  display: none;
}
</style>

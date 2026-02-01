<template>
  <div class="save-page" :class="{ 'has-result': resultUrl }" :style="pageStyle">
    <div v-if="!resultUrl" class="empty panel">
      <p>没有找到生成结果，请先生成图片。</p>
      <div class="actions">
        <button class="btn btn-primary" @click="goGenerate">去生成</button>
        <button class="btn btn-ghost" @click="goHome">返回首页</button>
      </div>
    </div>

    <div v-else class="save-content">
      <div class="qr-card">
        <div class="robot">AI</div>
        <div class="qr-title">照片下载中</div>
        <div class="qr-frame">
          <img v-if="qrDataUrl" :src="qrDataUrl" class="qr-img" alt="qr" />
          <div v-else class="loading">二维码生成中...</div>
          <div class="qr-label">二维码</div>
        </div>
      </div>

      <div class="qr-cta">扫描二维码领取电子版照片</div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import QRCode from "qrcode";

const router = useRouter();

const resultUrl = ref("");
const qrDataUrl = ref("");

const IDLE_MS = 60 * 1000;
let idleTimer = null;

const pageStyle = computed(() => {
  if (!resultUrl.value) return {};
  return {
    backgroundImage: `url(${resultUrl.value})`,
  };
});

function resetIdle() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    router.replace("/");
  }, IDLE_MS);
}

async function makeQr(url) {
  qrDataUrl.value = await QRCode.toDataURL(url, {
    width: 320,
    margin: 1,
  });
}

function goGenerate() {
  router.push("/generate");
}

function goHome() {
  router.push("/");
}

function bindIdleEvents() {
  const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
  const opts = { passive: true };
  events.forEach((ev) => window.addEventListener(ev, resetIdle, opts));
  resetIdle();

  return () => {
    events.forEach((ev) => window.removeEventListener(ev, resetIdle));
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = null;
  };
}

let unbindIdle = null;

onMounted(async () => {
  resultUrl.value = sessionStorage.getItem("resultUrl") || "";
  if (resultUrl.value) {
    await makeQr(resultUrl.value);
  }
  unbindIdle = bindIdleEvents();
});

onBeforeUnmount(() => {
  if (unbindIdle) unbindIdle();
});
</script>

<style scoped>
.save-page {
  min-height: calc(var(--vh) * 100);
  width: 100%;
  display: grid;
  place-items: center;
  background-size: cover;
  background-position: center;
  position: relative;
  padding: clamp(16px, calc(var(--vh) * 3), 40px);
}

.save-page.has-result::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
}

.save-content,
.empty {
  position: relative;
  z-index: 1;
}

.empty {
  text-align: center;
  display: grid;
  gap: 12px;
  font-size: clamp(16px, calc(var(--vh) * 2), 22px);
}

.save-content {
  display: grid;
  justify-items: center;
  gap: 18px;
}

.qr-card {
  width: min(420px, calc(var(--vw) * 86));
  background: rgba(255, 255, 255, 0.9);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.7);
  display: grid;
  gap: 12px;
  justify-items: center;
  position: relative;
}

.robot {
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
  font-size: clamp(18px, calc(var(--vh) * 2.2), 26px);
}

.qr-frame {
  width: min(260px, calc(var(--vw) * 60));
  aspect-ratio: 1 / 1;
  background: #f1f1f1;
  border-radius: 14px;
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
  font-size: clamp(14px, calc(var(--vh) * 1.6), 18px);
  color: #5a6675;
}

.loading {
  color: #5a6675;
  font-size: clamp(14px, calc(var(--vh) * 1.6), 18px);
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.qr-cta {
  padding: 12px 28px;
  border-radius: 14px;
  background: linear-gradient(135deg, #cf2a32, #b81d27);
  color: #ffffff;
  font-weight: 700;
  letter-spacing: 0.5px;
  box-shadow: 0 12px 26px rgba(207, 42, 50, 0.32);
  font-size: clamp(16px, calc(var(--vh) * 2), 24px);
}
</style>

<template>
  <div class="app-page mode-page">
    <header class="page-top">
      <button class="home-btn" type="button" @click="goHome" aria-label="home">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4.2 3 11.4v7.4a1 1 0 0 0 1 1h5.2v-5.6h5.6v5.6H20a1 1 0 0 0 1-1v-7.4l-9-7.2Z" />
        </svg>
      </button>
      <div>
        <div class="page-title-cn">请选择拍照模式</div>
        <div class="page-title-en">PLEASE SELECT THE PHOTO MODE</div>
      </div>
      <div class="page-timer">{{ timerText }}</div>
    </header>

    <section class="panel mode-card">
      <div class="preview">
        <img v-if="previewUrl" :src="previewUrl" alt="preview" />
        <div class="tag">{{ templateName || "精选模板" }}</div>
      </div>
    </section>

    <section class="countdown-panel">
      <div class="countdown-title">倒计时设置</div>
      <div class="countdown-options">
        <button
          v-for="sec in delayOptions"
          :key="sec"
          class="countdown-chip"
          :class="{ active: delaySec === sec }"
          @click="delaySec = sec"
        >
          {{ sec }}s
        </button>
      </div>
    </section>

    <div class="action-row">
      <button class="btn btn-ghost back-btn" @click="goBack">返回</button>
      <button class="btn btn-primary shoot-btn" @click="startShooting">
        现场拍摄
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

const baseUrl = import.meta.env.BASE_URL;

const delayOptions = [3, 5, 10];
const delaySec = ref(3);

const totalSeconds = 60;
const timer = ref(totalSeconds);
let intervalId = null;

const templateName = ref("");
const templateCover = ref("");
const themeId = ref("");
const templateId = ref("");

const timerText = computed(() => `${timer.value}s`);

const previewUrl = computed(() => {
  if (!templateCover.value) return "";
  if (/^https?:/.test(templateCover.value) || templateCover.value.startsWith("data:")) {
    return templateCover.value;
  }
  return `${baseUrl}${templateCover.value}`;
});

function startTimer() {
  clearInterval(intervalId);
  intervalId = setInterval(() => {
    timer.value -= 1;
    if (timer.value <= 0) {
      clearInterval(intervalId);
      router.push("/");
    }
  }, 1000);
}

function startShooting() {
  sessionStorage.setItem("photoDelaySec", String(delaySec.value));
  router.push({
    path: "/camera",
    query: {
      themeId: themeId.value,
      templateId: templateId.value,
      delay: delaySec.value,
    },
  });
}

function goHome() {
  router.push("/");
}

function goBack() {
  router.push({ path: "/templates", query: { themeId: themeId.value } });
}

onMounted(() => {
  themeId.value =
    route.query.themeId?.toString() || sessionStorage.getItem("themeId") || "";
  templateId.value =
    route.query.templateId?.toString() || sessionStorage.getItem("templateId") || "";
  templateName.value = sessionStorage.getItem("templateName") || "";
  templateCover.value = sessionStorage.getItem("templateCover") || "";

  if (themeId.value) sessionStorage.setItem("themeId", themeId.value);
  if (templateId.value) sessionStorage.setItem("templateId", templateId.value);

  const storedDelay = Number(sessionStorage.getItem("photoDelaySec"));
  if (!Number.isNaN(storedDelay)) {
    delaySec.value = storedDelay;
  }
  if (!delayOptions.includes(delaySec.value)) {
    delaySec.value = delayOptions[0];
  }

  startTimer();
});

onBeforeUnmount(() => {
  clearInterval(intervalId);
});
</script>

<style scoped>
.mode-page {
  color: var(--text);
  align-items: center;
  width: 100%;
  max-width: 100%;
  margin: 0;
  height: 100vh;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto auto;
  justify-items: stretch;
  gap: clamp(10px, 1.4vh, 18px);
  padding: 0;
  width: 100vw;
  max-width: 100vw;
  padding-bottom: clamp(36px, 5.2vh, 78px);
  overflow: hidden;
}

.mode-page .page-top {
  width: 100%;
  max-width: 100%;
  padding-top: clamp(52px, 7.8vh, 110px);
  padding-inline: clamp(24px, 3.2vh, 48px);
}

.mode-page .page-title-cn {
  font-size: clamp(68px, 8.4vh, 120px);
}

.mode-page .page-title-en {
  font-size: clamp(28px, 3.4vh, 44px);
  letter-spacing: 2px;
}

.mode-card {
  width: 100%;
  max-width: 100%;
  height: 100%;
  min-height: 0;
  display: grid;
  align-content: stretch;
  justify-items: stretch;
  padding: 0 clamp(24px, 3.2vh, 48px);
  background: transparent;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
  grid-template-rows: 1fr;
  align-self: stretch;
}

.preview {
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: none;
  border-radius: 24px;
  border: 3px solid rgba(80, 140, 210, 0.45);
  overflow: hidden;
  background: #f1f6ff;
  display: grid;
  place-items: center;
  position: relative;
  box-shadow: 0 18px 36px rgba(120, 150, 190, 0.24);
}

.preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tag {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 14px 40px;
  border-radius: 999px;
  background: #c6252d;
  color: #ffffff;
  font-weight: 700;
  font-size: clamp(56px, 7.2vh, 88px);
  box-shadow: 0 12px 26px rgba(198, 37, 45, 0.3);
}

.countdown-panel {
  width: 100%;
  max-width: 100%;
  display: grid;
  gap: 12px;
  text-align: center;
  padding-inline: clamp(24px, 3.2vh, 48px);
}

.countdown-title {
  font-weight: 700;
  color: #5a6675;
  font-size: clamp(34px, 4.6vh, 56px);
}

.countdown-options {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}

.countdown-chip {
  min-width: 240px;
  padding: 24px 44px;
  border-radius: 999px;
  border: 1px solid rgba(80, 140, 210, 0.35);
  background: rgba(255, 255, 255, 0.9);
  font-weight: 700;
  color: #4a5565;
  font-size: clamp(44px, 5.6vh, 72px);
  cursor: pointer;
}

.countdown-chip.active {
  background: #c6252d;
  color: #ffffff;
  border-color: #c6252d;
}

.action-row {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(18px, 2.6vh, 36px);
  padding-inline: clamp(24px, 3.2vh, 48px);
  flex-wrap: wrap;
}

.action-row .btn {
  width: min(520px, 40vw);
  font-size: clamp(56px, 7.2vh, 88px);
  padding-block: clamp(26px, 3.4vh, 44px);
  min-height: clamp(90px, 10vh, 140px);
}

.shoot-btn {
  justify-self: center;
}

@media (orientation: portrait) and (min-height: 2400px) {
  .mode-card {
    width: 100%;
    max-width: 100%;
    height: 100%;
  }
  .preview {
    height: 100%;
  }
  .action-row .btn {
    width: min(600px, 40vw);
  }
  .countdown-chip {
    min-width: 280px;
  }
}
</style>

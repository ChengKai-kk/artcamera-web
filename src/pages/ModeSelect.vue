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
      </div>
      <div class="tag">{{ templateName || "精选模板" }}</div>
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
          {{ sec === 0 ? "无" : sec + "s" }}
        </button>
      </div>
    </section>

    <button class="btn btn-primary shoot-btn" @click="startShooting">
      现场拍摄
    </button>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

const baseUrl = import.meta.env.BASE_URL;

const delayOptions = [0, 3, 5, 10];
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
}

.mode-card {
  width: min(760px, 92vw);
  display: grid;
  gap: 10px;
  justify-items: center;
  border-radius: 24px;
}

.preview {
  width: min(600px, 82vw);
  aspect-ratio: 3 / 4;
  border-radius: 20px;
  border: 2px solid rgba(80, 140, 210, 0.35);
  overflow: hidden;
  background: #f1f6ff;
  display: grid;
  place-items: center;
}

.preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tag {
  margin-top: -6px;
  padding: 8px 20px;
  border-radius: 999px;
  background: #c6252d;
  color: #ffffff;
  font-weight: 700;
  font-size: clamp(15px, 1.9vh, 22px);
}

.countdown-panel {
  width: min(660px, 90vw);
  display: grid;
  gap: 10px;
  text-align: center;
}

.countdown-title {
  font-weight: 700;
  color: #5a6675;
  font-size: clamp(16px, 2vh, 24px);
}

.countdown-options {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.countdown-chip {
  min-width: 72px;
  padding: 12px 20px;
  border-radius: 999px;
  border: 1px solid rgba(80, 140, 210, 0.35);
  background: rgba(255, 255, 255, 0.9);
  font-weight: 700;
  color: #4a5565;
  font-size: clamp(15px, 1.8vh, 22px);
  cursor: pointer;
}

.countdown-chip.active {
  background: #c6252d;
  color: #ffffff;
  border-color: #c6252d;
}

.shoot-btn {
  width: min(240px, 60vw);
  font-size: clamp(18px, 2.2vh, 26px);
}

@media (orientation: portrait) and (min-height: 2400px) {
  .mode-card {
    width: min(860px, 92vw);
  }
  .preview {
    width: min(680px, 86vw);
  }
  .shoot-btn {
    width: min(280px, 60vw);
  }
  .countdown-chip {
    min-width: 92px;
  }
}
</style>

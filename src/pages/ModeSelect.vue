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

    <div class="action-row">
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
  color: #333333;
  font-family: "Alibaba PuHuiTi", "Source Han Sans SC", "Noto Sans SC", "PingFang SC",
    "Microsoft YaHei", sans-serif;
  align-items: center;
  width: calc(var(--vw) * 100);
  max-width: calc(var(--vw) * 100);
  margin: 0;
  height: calc(var(--vh) * 100);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  justify-items: stretch;
  padding: 0;
  gap: 0;
  overflow: hidden;
  background:
    radial-gradient(720px 720px at 12% 12%, rgba(255, 226, 214, 0.7), transparent 70%),
    radial-gradient(860px 860px at 88% 16%, rgba(215, 232, 255, 0.65), transparent 70%),
    radial-gradient(760px 760px at 84% 84%, rgba(255, 214, 226, 0.5), transparent 70%),
    linear-gradient(150deg, rgba(246, 250, 255, 0.9) 0%, rgba(255, 244, 236, 0.9) 45%, rgba(255, 242, 250, 0.95) 100%);
}

.mode-page .page-top {
  width: 100%;
  max-width: 100%;
  padding-top: calc(var(--vh) * 7.25);
  padding-left: 0;
  padding-right: 0;
  grid-template-columns: 220px 1116px 1fr;
  column-gap: 142px;
  align-items: center;
}

.mode-page .home-btn {
  width: 220px;
  height: 220px;
  border-radius: 0 200px 200px 0;
  box-shadow: none;
  background: #ba1313;
  justify-self: start;
}

.mode-page .home-btn svg {
  width: 100px;
  height: 100px;
}

.mode-page .page-title-cn {
  font-size: calc(var(--vh) * 2.6);
  font-weight: 700;
  color: #333333;
  letter-spacing: 0;
}

.mode-page .page-title-en {
  font-size: calc(var(--vh) * 1.56);
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
  color: #333333;
  margin-top: 8px;
}

.mode-page .page-timer {
  font-size: calc(var(--vh) * 2.6);
  font-weight: 700;
  color: #333333;
  justify-self: start;
}

.mode-card {
  width: 100%;
  max-width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
  align-self: stretch;
  margin-top: 0;
  transform: none;
  pointer-events: none;
}

.preview {
  width: calc(var(--vw) * 66.5);
  height: calc(var(--vh) * 53.45);
  border-radius: 40px;
  overflow: hidden;
  background: #f1f6ff;
  display: grid;
  place-items: center;
  position: relative;
  box-shadow: none;
  border: none;
  transform: translateY(50px);
}

.preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 40px;
}

.tag {
  position: absolute;
  bottom: 148px;
  left: 50%;
  transform: translateX(-50%);
  width: 440px;
  height: 120px;
  border-radius: 200px;
  background: #ba1313;
  color: #ffffff;
  font-weight: 700;
  font-size: 58px;
  display: grid;
  place-items: center;
  box-shadow: none;
  padding: 0;
}

.action-row {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  margin-top: calc(var(--vh) * 5.36);
  margin-bottom: calc(var(--vh) * 11.85);
  z-index: 2;
  pointer-events: auto;
}

.action-row .btn {
  width: 440px;
  height: 136px;
  font-size: 56px;
  padding: 0;
  min-height: 136px;
}

.shoot-btn {
  background: #ba1313;
  border: none;
  color: #ffffff;
  box-shadow: none;
  pointer-events: auto;
}
</style>

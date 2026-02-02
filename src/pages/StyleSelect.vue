<template>
  <div class="style-page">
    <div v-if="status === 'loading'" class="panel loading">加载中...</div>

    <div v-else-if="status === 'error'" class="panel error">
      <div class="error-title">配置加载失败</div>
      <div class="error-desc">{{ errorMsg }}</div>
      <button class="btn btn-secondary" @click="load">重试</button>
    </div>

    <div v-else class="style-root">
      <div class="style-bg" :style="{ backgroundImage: `url(${fullBgUrl})` }" aria-hidden="true"></div>

      <button class="sample-btn" type="button" @click.stop="openSample">
        <span class="sr-only">样片模版展示</span>
      </button>

      <div class="theme-list" aria-label="主题选择区">
        <button class="theme-hit theme-hit-1" type="button" @click="selectThemeByIndex(0)">
          <span class="sr-only">主题 01</span>
        </button>
        <button class="theme-hit theme-hit-2" type="button" @click="selectThemeByIndex(1)">
          <span class="sr-only">主题 02</span>
        </button>
        <button class="theme-hit theme-hit-3" type="button" @click="selectThemeByIndex(2)">
          <span class="sr-only">主题 03</span>
        </button>
      </div>

      <button class="back-btn" type="button" @click="goHome">
        <span class="sr-only">返回</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const status = ref("loading");
const errorMsg = ref("");
const data = ref(null);

const themes = computed(() => data.value?.themes || []);

const baseUrl = import.meta.env.BASE_URL;
const fullBgUrl = computed(() => `${baseUrl}风格选择界面整页图.webp`);
const fallbackIds = ["west", "real", "dimension"];

async function load() {
  status.value = "loading";
  errorMsg.value = "";

  try {
    const url = `${baseUrl}config/styles.json`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data.value = await res.json();

    if (!Array.isArray(data.value?.themes) || data.value.themes.length === 0) {
      throw new Error("themes 列表为空，请检查 public/config/styles.json");
    }

    status.value = "ready";
  } catch (e) {
    status.value = "error";
    errorMsg.value = e?.message || String(e);
  }
}

function selectThemeByIndex(index) {
  const theme = themes.value?.[index];
  const themeId = theme?.id || fallbackIds[index] || fallbackIds[0];
  sessionStorage.setItem("themeId", themeId);
  sessionStorage.setItem("themeName", theme?.name || "");
  sessionStorage.setItem("themeCover", theme?.cover || "");
  router.push({ path: "/templates", query: { themeId } });
}

function openSample() {
  selectThemeByIndex(0);
}

function goHome() {
  router.push("/");
}

onMounted(load);
</script>

<style scoped>
.style-page {
  width: 100%;
  max-width: 100%;
  margin: 0;
  height: 100%;
  position: relative;
}

.loading,
.error {
  text-align: center;
  display: grid;
  gap: 12px;
}

.error-title {
  font-weight: 700;
  font-size: clamp(20px, calc(var(--vh) * 2.4), 32px);
}

.error-desc {
  color: var(--muted);
  font-size: clamp(14px, calc(var(--vh) * 1.6), 18px);
}

.style-root {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.style-bg {
  position: absolute;
  inset: 0;
  background-repeat: no-repeat;
  background-size: 2160px 3840px;
  background-position: left top;
  z-index: 1;
}

.sample-btn {
  position: absolute;
  left: 245px;
  top: 921px;
  width: 476px;
  height: 148px;
  border-radius: 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  z-index: 3;
}

.theme-list {
  position: absolute;
  left: 245px;
  top: 1491px;
  width: 1670px;
  height: 1762px;
  z-index: 3;
}

.theme-hit {
  position: absolute;
  left: 0;
  width: 1670px;
  height: 460px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.theme-hit-1 {
  top: 36px;
}

.theme-hit-2 {
  top: 560px;
}

.theme-hit-3 {
  top: 1228px;
}

.back-btn {
  position: absolute;
  left: 860px;
  top: 3308px;
  width: 440px;
  height: 136px;
  border-radius: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  z-index: 3;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>

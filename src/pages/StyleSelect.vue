<template>
  <div class="app-page style-page">
    <div v-if="status === 'loading'" class="panel loading">加载中...</div>

    <div v-else-if="status === 'error'" class="panel error">
      <div class="error-title">配置加载失败</div>
      <div class="error-desc">{{ errorMsg }}</div>
      <button class="btn btn-secondary" @click="load">重试</button>
    </div>

    <div v-else class="content">
      <header class="style-head">
        <div class="brand">
          <div class="brand-title">{{ pageTitle }}</div>
          <div class="brand-subtitle">{{ pageSubtitle }}</div>
          <button class="demo-btn" type="button" @click.stop="openSample">
            {{ pageCta }}
            <span class="demo-arrow">>>></span>
          </button>
        </div>
        <div class="sample-card">
          <img v-if="sampleImage" :src="sampleImage" alt="sample" />
        </div>
      </header>

      <section class="theme-block">
        <div class="theme-list">
          <button
            v-for="theme in themes"
            :key="theme.id"
            class="theme-card"
            :class="`tone-${theme.tone}`"
            type="button"
            @click="selectTheme(theme)"
          >
            <div class="theme-number">{{ theme.number }}</div>
            <div class="theme-text">
              <div class="theme-name">{{ theme.name }}</div>
              <div class="theme-en">{{ theme.en }}</div>
            </div>
            <div class="theme-avatar">
              <img v-if="themeCover(theme)" :src="themeCover(theme)" :alt="theme.name" />
            </div>
          </button>
        </div>

        <button class="btn btn-ghost back-btn" @click="goHome">返回</button>
      </section>
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

const pageTitle = computed(() => data.value?.title || "请选择风格");
const pageSubtitle = computed(() => data.value?.subtitle || "");
const pageCta = computed(() => data.value?.cta || "样片模板展示");
const themes = computed(() => data.value?.themes || []);

const baseUrl = import.meta.env.BASE_URL;

function resolveAsset(path) {
  if (!path) return "";
  if (/^https?:/.test(path) || path.startsWith("data:")) return path;
  return `${baseUrl}${path}`;
}

const sampleImage = computed(() => resolveAsset(data.value?.sample || ""));

function themeCover(theme) {
  return resolveAsset(theme?.cover || "");
}

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

function selectTheme(theme) {
  sessionStorage.setItem("themeId", theme.id);
  sessionStorage.setItem("themeName", theme.name);
  sessionStorage.setItem("themeCover", theme.cover || "");
  router.push({ path: "/templates", query: { themeId: theme.id } });
}

function openSample() {
  const first = themes.value?.[0];
  if (first) selectTheme(first);
}

function goHome() {
  router.push("/");
}

onMounted(load);
</script>

<style scoped>
.style-page {
  color: var(--text);
  width: 100%;
  max-width: 100%;
  margin: 0;
  min-height: calc(var(--vh) * 100);
  height: calc(var(--vh) * 100);
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

.content {
  display: grid;
  gap: clamp(20px, calc(var(--vh) * 2.6), 36px);
  grid-template-rows: auto minmax(0, 1fr);
  height: 100%;
  min-height: 0;
}

.style-head {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: clamp(24px, calc(var(--vh) * 3.4), 48px);
  align-items: start;
  padding-top: clamp(36px, calc(var(--vh) * 5.6), 72px);
  padding-inline: clamp(24px, calc(var(--vh) * 3.2), 48px);
}

.brand {
  margin-left: 10%;
  padding-top: 10%;
  display: grid;
  gap: clamp(16px, calc(var(--vh) * 2.2), 34px);
}

.brand-title {
  font-weight: 800;
  font-size: clamp(80px, calc(var(--vh) * 10.2), 130px);
  color: #c6252d;
}

.brand-subtitle {
  margin-top: 0;
  font-size: clamp(56px, calc(var(--vh) * 7.2), 96px);
  color: #c6252d;
  font-weight: 600;
}

.demo-btn {
  margin-top: 0;
  padding: 24px 60px;
  border-radius: 20px;
  border: 2px solid rgba(198, 37, 45, 0.5);
  background: rgba(255, 255, 255, 0.96);
  color: #c6252d;
  font-weight: 700;
  font-size: clamp(46px, calc(var(--vh) * 5.8), 82px);
  letter-spacing: 2px;
  font-family: "Rajdhani", "DIN Alternate", "DIN Condensed", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(198, 37, 45, 0.12);
}

.demo-arrow {
  margin-left: 8px;
  letter-spacing: 2px;
  font-weight: 800;
}

.sample-card {
  width: min(680px, calc(var(--vw) * 42));
  border-radius: 22px;
  aspect-ratio: 3 / 4;
  border: 3px solid rgba(74, 164, 255, 0.7);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 30px rgba(120, 150, 190, 0.22);
  overflow: hidden;
  justify-self: center;
}

.sample-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.theme-block {
  display: grid;
  gap: clamp(12px, calc(var(--vh) * 1.6), 22px);
  align-content: start;
  min-height: 0;
}

.theme-list {
  display: grid;
  gap: clamp(14px, calc(var(--vh) * 2), 28px);
  width: 100%;
  align-content: start;
  grid-auto-rows: max-content;
  padding-block: clamp(4px, calc(var(--vh) * 0.6), 10px);
}

.theme-card {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  align-items: start;
  justify-items: start;
  gap: clamp(6px, calc(var(--vh) * 0.9), 14px);
  padding: clamp(28px, calc(var(--vh) * 4.48), 62px) clamp(260px, calc(var(--vh) * 34), 330px) clamp(28px, calc(var(--vh) * 4.48), 62px) clamp(48px, calc(var(--vh) * 6), 86px);
  padding-left: calc(5% + clamp(44px, calc(var(--vh) * 5.2), 74px));
  border-radius: 999px;
  border: none;
  cursor: pointer;
  box-shadow: 0 18px 36px rgba(120, 140, 170, 0.2);
  text-align: left;
  min-height: clamp(149px, calc(var(--vh) * 12.3), 240px);
  width: 90%;
  justify-self: center;
}

.theme-number {
  font-weight: 800;
  font-size: clamp(96px, calc(var(--vh) * 12.3), 165px);
  color: rgba(255, 255, 255, 0.9);
  text-align: left;
}

.theme-text {
  color: #ffffff;
  display: grid;
  gap: clamp(6px, calc(var(--vh) * 0.8), 12px);
}

.theme-name {
  font-size: clamp(62px, calc(var(--vh) * 8.2), 102px);
  font-weight: 800;
  text-align: left;
}

.theme-en {
  font-size: clamp(39px, calc(var(--vh) * 5.1), 59px);
  letter-spacing: 1px;
  opacity: 0.9;
  margin-top: 0;
  text-align: left;
}

.theme-avatar {
  position: absolute;
  right: clamp(16px, calc(var(--vh) * 3), 28px);
  top: 50%;
  transform: translateY(-50%);
  width: clamp(340px, calc(var(--vh) * 40), 460px);
  height: clamp(340px, calc(var(--vh) * 40), 460px);
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
  border: 3px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.12);
}

.theme-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tone-blue {
  background: linear-gradient(135deg, #9cc9ff, #6fb2ff);
}

.tone-peach {
  background: linear-gradient(135deg, #ffc6b6, #ffb4bf);
}

.tone-lavender {
  background: linear-gradient(135deg, #c8bcff, #b6b3ff);
}

.back-btn {
  justify-self: center;
  padding-inline: 175px;
  padding-block: clamp(28px, calc(var(--vh) * 3.6), 52px);
  font-size: clamp(50px, calc(var(--vh) * 6.5), 80px);
}
</style>

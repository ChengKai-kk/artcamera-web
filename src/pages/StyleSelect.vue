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

      <section class="theme-list">
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
      </section>

      <button class="btn btn-ghost back-btn" @click="goHome">返回</button>
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
}

.loading,
.error {
  text-align: center;
  display: grid;
  gap: 12px;
}

.error-title {
  font-weight: 700;
  font-size: clamp(20px, 2.4vh, 32px);
}

.error-desc {
  color: var(--muted);
  font-size: clamp(14px, 1.6vh, 18px);
}

.content {
  display: grid;
  gap: clamp(18px, 2.6vh, 34px);
}

.style-head {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: clamp(18px, 3vh, 40px);
  align-items: start;
}

.brand-title {
  font-weight: 800;
  font-size: clamp(32px, 4vh, 54px);
  color: #c6252d;
}

.brand-subtitle {
  margin-top: 8px;
  font-size: clamp(16px, 2.2vh, 26px);
  color: #c6252d;
  font-weight: 600;
}

.demo-btn {
  margin-top: 18px;
  padding: 12px 26px;
  border-radius: 12px;
  border: 2px solid rgba(198, 37, 45, 0.5);
  background: rgba(255, 255, 255, 0.96);
  color: #c6252d;
  font-weight: 700;
  font-size: clamp(16px, 2vh, 22px);
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(198, 37, 45, 0.12);
}

.demo-arrow {
  margin-left: 8px;
  letter-spacing: 2px;
  font-weight: 800;
}

.sample-card {
  width: min(320px, 36vw);
  border-radius: 18px;
  border: 3px solid rgba(74, 164, 255, 0.7);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 30px rgba(120, 150, 190, 0.22);
  overflow: hidden;
  justify-self: end;
}

.sample-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.theme-list {
  display: grid;
  gap: clamp(18px, 2.6vh, 28px);
}

.theme-card {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: clamp(16px, 2.6vh, 28px);
  padding: clamp(18px, 2.8vh, 30px) clamp(140px, 22vh, 180px) clamp(18px, 2.8vh, 30px) clamp(28px, 3vh, 40px);
  border-radius: 999px;
  border: none;
  cursor: pointer;
  box-shadow: 0 18px 36px rgba(120, 140, 170, 0.2);
  text-align: left;
}

.theme-number {
  font-weight: 800;
  font-size: clamp(28px, 3.6vh, 46px);
  color: rgba(255, 255, 255, 0.9);
}

.theme-text {
  color: #ffffff;
}

.theme-name {
  font-size: clamp(22px, 3vh, 34px);
  font-weight: 800;
}

.theme-en {
  font-size: clamp(14px, 1.8vh, 22px);
  letter-spacing: 1px;
  opacity: 0.9;
  margin-top: 6px;
}

.theme-avatar {
  position: absolute;
  right: clamp(16px, 3vh, 28px);
  bottom: -6px;
  width: clamp(90px, 14vh, 140px);
  height: clamp(90px, 14vh, 140px);
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
  padding-inline: 50px;
}

@media (max-width: 720px) {
  .style-head {
    grid-template-columns: 1fr;
  }
  .sample-card {
    justify-self: start;
  }
  .theme-card {
    grid-template-columns: auto 1fr;
    padding-right: clamp(80px, 18vh, 120px);
  }
  .theme-avatar {
    width: clamp(70px, 10vh, 110px);
    height: clamp(70px, 10vh, 110px);
  }
}

@media (orientation: portrait) and (min-height: 2400px) {
  .theme-card {
    padding: clamp(22px, 3vh, 32px) clamp(160px, 24vh, 200px) clamp(22px, 3vh, 32px) clamp(32px, 3.4vh, 46px);
  }
  .theme-name {
    font-size: clamp(26px, 3.2vh, 38px);
  }
  .theme-en {
    font-size: clamp(16px, 2vh, 24px);
  }
  .demo-btn {
    font-size: clamp(18px, 2.2vh, 26px);
  }
}
</style>

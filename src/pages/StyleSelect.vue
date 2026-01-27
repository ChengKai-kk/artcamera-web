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
  min-height: 100vh;
  height: 100vh;
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
  gap: clamp(20px, 2.6vh, 36px);
  grid-template-rows: auto minmax(0, 1fr);
  height: 100%;
  min-height: 0;
}

.style-head {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: clamp(24px, 3.4vh, 48px);
  align-items: start;
  padding-top: clamp(36px, 5.6vh, 72px);
  padding-inline: clamp(24px, 3.2vh, 48px);
}

.brand {
  margin-left: 10%;
  padding-top: 10%;
  display: grid;
  gap: clamp(16px, 2.2vh, 34px);
}

.brand-title {
  font-weight: 800;
  font-size: clamp(75px, 9.75vh, 120px);
  color: #c6252d;
}

.brand-subtitle {
  margin-top: 0;
  font-size: clamp(52px, 6.6vh, 90px);
  color: #c6252d;
  font-weight: 600;
}

.demo-btn {
  margin-top: 0;
  padding: 20px 52px;
  border-radius: 20px;
  border: 2px solid rgba(198, 37, 45, 0.5);
  background: rgba(255, 255, 255, 0.96);
  color: #c6252d;
  font-weight: 700;
  font-size: clamp(40px, 5.2vh, 72px);
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
  width: min(540px, 44vw);
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
  gap: clamp(12px, 1.6vh, 22px);
  align-content: start;
  min-height: 0;
}

.theme-list {
  display: grid;
  gap: clamp(14px, 2vh, 28px);
  width: 100%;
  align-content: start;
  grid-auto-rows: max-content;
  padding-block: clamp(4px, 0.6vh, 10px);
}

.theme-card {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  align-items: start;
  justify-items: start;
  gap: clamp(6px, 0.9vh, 14px);
  padding: clamp(24px, 3.92vh, 54px) clamp(230px, 32vh, 300px) clamp(24px, 3.92vh, 54px) clamp(44px, 5.4vh, 78px);
  padding-left: calc(5% + clamp(40px, 4.6vh, 66px));
  border-radius: 999px;
  border: none;
  cursor: pointer;
  box-shadow: 0 18px 36px rgba(120, 140, 170, 0.2);
  text-align: left;
  min-height: clamp(136px, 13vh, 240px);
  width: 90%;
  justify-self: center;
}

.theme-number {
  font-weight: 800;
  font-size: clamp(96px, 12.3vh, 165px);
  color: rgba(255, 255, 255, 0.9);
  text-align: left;
}

.theme-text {
  color: #ffffff;
  display: grid;
  gap: clamp(6px, 0.8vh, 12px);
}

.theme-name {
  font-size: clamp(66px, 8.6vh, 105px);
  font-weight: 800;
  text-align: left;
}

.theme-en {
  font-size: clamp(39px, 5.7vh, 66px);
  letter-spacing: 1px;
  opacity: 0.9;
  margin-top: 0;
  text-align: left;
}

.theme-avatar {
  position: absolute;
  right: clamp(16px, 3vh, 28px);
  top: 50%;
  transform: translateY(-50%);
  width: clamp(280px, 40vh, 420px);
  height: clamp(280px, 40vh, 420px);
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
  padding-block: clamp(28px, 3.6vh, 52px);
  font-size: clamp(50px, 6.5vh, 80px);
}

@media (max-width: 720px) {
  .style-head {
    grid-template-columns: 1fr;
  }
  .sample-card {
    justify-self: start;
  }
  .theme-card {
    grid-template-columns: 1fr;
    padding-right: clamp(80px, 18vh, 120px);
  }
  .theme-avatar {
    width: clamp(70px, 10vh, 110px);
    height: clamp(70px, 10vh, 110px);
  }
  .style-page {
    height: auto;
  }
  .theme-block {
    height: auto;
  }
}

@media (orientation: portrait) and (min-height: 2400px) {
  .theme-card {
    padding: clamp(28px, 4.48vh, 62px) clamp(260px, 34vh, 330px) clamp(28px, 4.48vh, 62px) clamp(48px, 6vh, 86px);
    padding-left: calc(5% + clamp(44px, 5.2vh, 74px));
    min-height: clamp(149px, 12.3vh, 240px);
  }
  .theme-name {
    font-size: clamp(82px, 10.3vh, 125px);
  }
  .theme-en {
    font-size: clamp(47px, 7vh, 78px);
  }
  .demo-btn {
    font-size: clamp(44px, 5.6vh, 78px);
    padding: 22px 56px;
  }
  .sample-card {
    width: min(620px, 44vw);
  }
  .theme-avatar {
    width: clamp(340px, 40vh, 460px);
    height: clamp(340px, 40vh, 460px);
  }
}

@media (orientation: portrait) and (min-height: 3600px) {
  .brand-title {
    font-size: clamp(80px, 10.2vh, 130px);
  }
  .brand-subtitle {
    font-size: clamp(56px, 7.2vh, 96px);
  }
  .demo-btn {
    padding: 24px 60px;
    font-size: clamp(46px, 5.8vh, 82px);
  }
  .sample-card {
    width: min(680px, 42vw);
  }
  .theme-number {
    font-size: clamp(96px, 12.3vh, 165px);
  }
  .theme-name {
    font-size: clamp(62px, 8.2vh, 102px);
  }
  .theme-en {
    font-size: clamp(39px, 5.1vh, 59px);
  }
}
</style>

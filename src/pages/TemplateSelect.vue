<template>
  <div class="app-page template-page">
    <header class="page-top">
      <button class="home-btn" type="button" @click="goHome" aria-label="home">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4.2 3 11.4v7.4a1 1 0 0 0 1 1h5.2v-5.6h5.6v5.6H20a1 1 0 0 0 1-1v-7.4l-9-7.2Z" />
        </svg>
      </button>
      <div>
        <div class="page-title-cn">请选择照片模版</div>
        <div class="page-title-en">PLEASE SELECT A PHOTO TEMPLATE</div>
      </div>
      <div class="page-timer"></div>
    </header>

    <section v-if="status === 'loading'" class="panel loading">加载中...</section>
    <section v-else-if="status === 'error'" class="panel error">
      <div class="error-title">配置加载失败</div>
      <div class="error-desc">{{ errorMsg }}</div>
      <button class="btn btn-secondary" @click="load">重试</button>
    </section>

    <section v-else class="panel template-panel">
      <div v-if="useFeatureLayout" class="feature-layout">
        <button
          v-if="mainTemplate"
          class="feature-card feature-main"
          :class="{ disabled: mainTemplate.id === 'more' && !mainTemplate.cover }"
          type="button"
          @click="selectTemplate(mainTemplate)"
        >
          <div class="template-thumb large" :class="{ empty: !mainTemplate.cover }">
            <img
              v-if="mainTemplate.cover"
              :src="templateCover(mainTemplate)"
              :alt="mainTemplate.name"
            />
            <div v-else class="placeholder">{{ placeholderText(mainTemplate) }}</div>
            <div v-if="mainTemplate.cover" class="template-label">{{ mainTemplate.name }}</div>
          </div>
        </button>

        <div class="feature-side">
          <button
            v-for="tpl in sideTemplates"
            :key="tpl.id"
            class="feature-card feature-side-card"
            :class="{ disabled: tpl.id === 'more' && !tpl.cover }"
            type="button"
            @click="selectTemplate(tpl)"
          >
            <div class="template-thumb" :class="{ empty: !tpl.cover }">
              <img v-if="tpl.cover" :src="templateCover(tpl)" :alt="tpl.name" />
              <div v-else class="placeholder">{{ placeholderText(tpl) }}</div>
              <div v-if="tpl.cover" class="template-label">{{ tpl.name }}</div>
            </div>
          </button>
        </div>

        <div class="feature-bottom">
          <button
            v-for="tpl in bottomTemplates"
            :key="tpl.id"
            class="feature-card feature-bottom-card"
            :class="{ disabled: tpl.id === 'more' && !tpl.cover }"
            type="button"
            @click="selectTemplate(tpl)"
          >
            <div class="template-thumb small" :class="{ empty: !tpl.cover }">
              <img v-if="tpl.cover" :src="templateCover(tpl)" :alt="tpl.name" />
              <div v-else class="placeholder">{{ placeholderText(tpl) }}</div>
              <div v-if="tpl.cover" class="template-label">{{ tpl.name }}</div>
            </div>
          </button>
        </div>
      </div>

      <div v-else class="grid-layout">
        <button
          v-for="tpl in templates"
          :key="tpl.id"
          class="grid-card"
          :class="{ disabled: tpl.id === 'more' && !tpl.cover }"
          type="button"
          @click="selectTemplate(tpl)"
        >
          <div class="template-thumb" :class="{ empty: !tpl.cover }">
            <img v-if="tpl.cover" :src="templateCover(tpl)" :alt="tpl.name" />
            <div v-else class="placeholder">{{ placeholderText(tpl) }}</div>
            <div v-if="tpl.cover" class="template-label">{{ tpl.name }}</div>
          </div>
        </button>
      </div>
    </section>

    <button class="btn btn-ghost back-btn" @click="goBack">返回</button>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

const status = ref("loading");
const errorMsg = ref("");
const data = ref(null);
const themeId = ref("");

const baseUrl = import.meta.env.BASE_URL;
const reusePhoto = computed(() => route.query.reuse === "1");

function resolveAsset(path) {
  if (!path) return "";
  if (/^https?:/.test(path) || path.startsWith("data:")) return path;
  return `${baseUrl}${path}`;
}

const theme = computed(() => {
  if (!data.value || !themeId.value) return null;
  return (data.value.themes || []).find((t) => t.id === themeId.value);
});

const templates = computed(() => theme.value?.templates || []);

const layoutMode = computed(() => theme.value?.templatesLayout || "auto");
const useFeatureLayout = computed(() => {
  if (layoutMode.value === "feature") return true;
  if (layoutMode.value === "grid") return false;
  return templates.value.length <= 6;
});

const mainTemplate = computed(() => templates.value[0] || null);
const sideTemplates = computed(() => templates.value.slice(1, 3));
const bottomTemplates = computed(() => templates.value.slice(3, 6));

function templateCover(tpl) {
  return resolveAsset(tpl?.cover || "");
}

function placeholderText(tpl) {
  if (!tpl) return "暂无封面";
  if (tpl.id === "more") return "更多模版...";
  return tpl.name || "暂无封面";
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

    const id = route.query.themeId || sessionStorage.getItem("themeId");
    themeId.value = id || data.value.themes[0]?.id || "";
    if (themeId.value) sessionStorage.setItem("themeId", themeId.value);

    if (!theme.value) throw new Error("未找到对应主题，请返回重试");

    status.value = "ready";
  } catch (e) {
    status.value = "error";
    errorMsg.value = e?.message || String(e);
  }
}

function selectTemplate(tpl) {
  if (!tpl) return;
  if (tpl.id === "more" && !tpl.cover) return;
  sessionStorage.setItem("templateId", tpl.id);
  sessionStorage.setItem("templateName", tpl.name);
  sessionStorage.setItem("templateCover", tpl.cover || "");
  const imageBase64 = sessionStorage.getItem("imageBase64");
  if (reusePhoto.value && imageBase64) {
    const styleId = `${themeId.value}_${tpl.id}`;
    sessionStorage.setItem("styleId", styleId);
    sessionStorage.setItem("artcam_styleId", styleId);
    router.push({ path: "/generate" });
    return;
  }
  router.push({ path: "/mode", query: { themeId: themeId.value, templateId: tpl.id } });
}

function goHome() {
  router.push("/");
}

function goBack() {
  router.push("/styles");
}

onMounted(load);
</script>

<style scoped>
.template-page {
  color: #333333;
  font-family: "Alibaba PuHuiTi", "Source Han Sans SC", "Noto Sans SC", "PingFang SC",
    "Microsoft YaHei", sans-serif;
  width: 100%;
  max-width: none;
  padding: 0;
  gap: 0;
  background:
    radial-gradient(720px 720px at 12% 12%, rgba(255, 226, 214, 0.7), transparent 70%),
    radial-gradient(860px 860px at 88% 16%, rgba(215, 232, 255, 0.65), transparent 70%),
    radial-gradient(760px 760px at 84% 84%, rgba(255, 214, 226, 0.5), transparent 70%),
    linear-gradient(150deg, rgba(246, 250, 255, 0.9) 0%, rgba(255, 244, 236, 0.9) 45%, rgba(255, 242, 250, 0.95) 100%);
}

.template-page .page-top {
  padding-top: calc(var(--vh) * 7.25);
  padding-left: 0;
  padding-right: 0;
  grid-template-columns: 220px 1fr 200px;
  column-gap: 142px;
  align-items: center;
}

.template-page .home-btn {
  width: 220px;
  height: 220px;
  border-radius: 0 200px 200px 0;
  box-shadow: none;
  background: #ba1313;
  justify-self: start;
}

.template-page .home-btn svg {
  width: 100px;
  height: 100px;
}

.template-page .page-title-cn {
  font-size: calc(var(--vh) * 2.6);
  font-weight: 700;
  color: #333333;
  letter-spacing: 0;
}

.template-page .page-title-en {
  font-size: calc(var(--vh) * 1.56);
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
  color: #333333;
  margin-top: 8px;
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

.template-panel {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  margin-top: calc(var(--vh) * 10.95);
}

.feature-layout {
  display: grid;
  grid-template-columns: 1.45fr 0.95fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    "main side"
    "bottom bottom";
  gap: clamp(16px, calc(var(--vh) * 2.4), 26px);
  max-height: none;
  min-height: clamp(520px, calc(var(--vh) * 58), 1280px);
  align-content: center;
}

.feature-card,
.grid-card {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.feature-main {
  grid-area: main;
}

.feature-side {
  grid-area: side;
  display: grid;
  gap: clamp(16px, calc(var(--vh) * 2.4), 26px);
}

.feature-bottom {
  grid-area: bottom;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(16px, calc(var(--vh) * 2.4), 26px);
}

.grid-layout {
  display: grid;
  grid-template-columns: repeat(3, calc(var(--vw) * 21));
  column-gap: calc(var(--vw) * 1.76);
  row-gap: calc(var(--vh) * 1.43);
  width: calc((var(--vw) * 21 * 3) + (var(--vw) * 1.76 * 2));
  height: calc(var(--vh) * 53.72);
  margin: 0 auto;
  overflow-y: auto;
  padding-right: 0;
  align-content: start;
}

.grid-layout::-webkit-scrollbar {
  width: 26px;
}

.grid-layout::-webkit-scrollbar-track {
  background: rgba(146, 146, 146, 0.3);
  border-radius: 40px;
}

.grid-layout::-webkit-scrollbar-thumb {
  background: rgba(140, 140, 140, 0.8);
  border-radius: 40px;
  border: 8px solid transparent;
  background-clip: content-box;
}

.disabled {
  opacity: 0.6;
  cursor: default;
}

.template-thumb {
  position: relative;
  border-radius: 40px;
  overflow: hidden;
  border: none;
  background: transparent;
  display: grid;
  place-items: center;
  box-shadow: none;
  width: calc(var(--vw) * 21);
  height: calc(var(--vh) * 16.95);
}

.template-thumb.large {
  aspect-ratio: 3 / 4;
}

.template-thumb.small {
  aspect-ratio: 3 / 4;
}

.template-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 40px;
}

.template-thumb.empty {
  border: 2px dashed rgba(120, 120, 120, 0.4);
}

.placeholder {
  color: #ffffff;
  font-weight: 700;
  font-size: calc(var(--vh) * 1.46);
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.35);
}

.template-label {
  position: absolute;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  padding: 0;
  border-radius: 0;
  background: transparent;
  color: #ffffff;
  font-weight: 700;
  font-size: calc(var(--vh) * 1.46);
  letter-spacing: 0;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.35);
}

.back-btn {
  justify-self: center;
  width: 440px;
  height: 136px;
  padding: 0;
  margin-top: calc(var(--vh) * 8.54);
  margin-bottom: calc(var(--vh) * 10.3);
  margin-left: auto;
  margin-right: auto;
  font-size: calc(var(--vh) * 1.46);
  font-weight: 700;
  letter-spacing: 0.2em;
  border-radius: 24px;
  background: #6f88a4;
  color: #ffffff;
  border: none;
  box-shadow: none;
}
</style>

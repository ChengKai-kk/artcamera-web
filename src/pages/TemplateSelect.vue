<template>
  <div class="app-page template-page">
    <header class="page-top">
      <button class="home-btn" type="button" @click="goHome" aria-label="home">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4.2 3 11.4v7.4a1 1 0 0 0 1 1h5.2v-5.6h5.6v5.6H20a1 1 0 0 0 1-1v-7.4l-9-7.2Z" />
        </svg>
      </button>
      <div>
        <div class="page-title-cn">请选择照片模板</div>
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
            <div v-else class="placeholder">更多模板...</div>
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
              <div v-else class="placeholder">更多模板...</div>
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
              <div v-else class="placeholder">更多模板...</div>
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
            <div v-else class="placeholder">更多模板...</div>
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

.template-panel {
  background: var(--panel-strong);
  border: 2px solid rgba(74, 164, 255, 0.6);
  padding: clamp(16px, 2.4vh, 26px);
}

.feature-layout {
  display: grid;
  grid-template-columns: 1.45fr 0.95fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    "main side"
    "bottom bottom";
  gap: clamp(16px, 2.4vh, 26px);
  max-height: min(66vh, 1200px);
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
  gap: clamp(16px, 2.4vh, 26px);
}

.feature-bottom {
  grid-area: bottom;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(16px, 2.4vh, 26px);
}

.grid-layout {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(16px, 2.4vh, 26px);
  max-height: min(64vh, 1180px);
  overflow-y: auto;
  padding-right: 8px;
}

.grid-layout::-webkit-scrollbar {
  width: 8px;
}

.grid-layout::-webkit-scrollbar-track {
  background: rgba(180, 190, 205, 0.35);
  border-radius: 999px;
}

.grid-layout::-webkit-scrollbar-thumb {
  background: rgba(150, 160, 175, 0.65);
  border-radius: 999px;
}

.disabled {
  opacity: 0.6;
  cursor: default;
}

.template-thumb {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid rgba(90, 150, 220, 0.4);
  background: #f0f6ff;
  aspect-ratio: 3 / 4;
  display: grid;
  place-items: center;
  box-shadow: 0 14px 26px rgba(120, 150, 190, 0.22);
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
}

.template-thumb.empty {
  border-style: dashed;
}

.placeholder {
  color: #6a7a90;
  font-weight: 700;
  font-size: clamp(14px, 1.8vh, 20px);
}

.template-label {
  position: absolute;
  left: 10px;
  bottom: 10px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
  color: #ffffff;
  font-weight: 700;
  font-size: clamp(14px, 1.7vh, 20px);
  letter-spacing: 0.5px;
}

.back-btn {
  justify-self: center;
  padding-inline: 50px;
}

@media (max-width: 900px) {
  .grid-layout {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .grid-layout {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .feature-layout {
    grid-template-columns: 1fr;
    grid-template-areas:
      "main"
      "side"
      "bottom";
  }
  .feature-bottom {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (orientation: portrait) and (min-height: 2400px) {
  .grid-layout {
    max-height: min(70vh, 1500px);
  }
  .template-label {
    font-size: clamp(16px, 2vh, 24px);
  }
  .placeholder {
    font-size: clamp(16px, 2vh, 22px);
  }
}
</style>

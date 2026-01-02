<template>
  <!-- 整屏可点：符合“点击屏幕开始体验” -->
  <div class="kiosk" @click="start">
    <!-- 主视觉区：效果图轮播 -->
    <section class="hero" @click.stop="start">
      <div class="tag">效果图</div>

      <!-- 语言按钮（先做外观，后面再接功能） -->
      <button class="lang" type="button" @click.stop="toggleLang">
        A {{ langLabel }}
      </button>

      <div class="frame">
        <div class="track" :style="trackStyle">
          <div class="slide" v-for="(s, i) in slides" :key="i">
            <img :src="s.src" class="img" :alt="s.title" />
          </div>
        </div>

        <!-- 左下小预览（像你截图那样） -->
        <div class="preview">
          <img :src="slides[current].src" class="previewImg" alt="preview" />
        </div>
      </div>
    </section>

    <!-- 开始按钮（主要入口） -->
    <div class="startWrap">
      <button class="startBtn btn" type="button" @click.stop="start">
        点击屏幕开始体验
      </button>
    </div>

    <!-- 使用流程说明（底部 01/02/03） -->
    <section class="flow" @click.stop="start">
      <div class="card" v-for="(st, i) in steps" :key="i">
        <div class="no">{{ String(i + 1).padStart(2, "0") }}</div>
        <img :src="st.src" class="thumb" :alt="st.title" />
        <div class="title">{{ st.title }}</div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import effect1 from "../assets/effects/effect-1.jpg";
import effect2 from "../assets/effects/effect-2.jpg";
import effect3 from "../assets/effects/effect-3.jpg";

import step1 from "../assets/steps/step-1.jpg";
import step2 from "../assets/steps/step-2.jpg";
import step3 from "../assets/steps/step-3.jpg";

const router = useRouter();

const slides = [
  { src: effect1, title: "效果 1" },
  { src: effect2, title: "效果 2" },
  { src: effect3, title: "效果 3" },
];

const steps = [
  { src: step1, title: "选择风格" },
  { src: step2, title: "拍摄/上传" },
  { src: step3, title: "照片打印" }, // 你也可以改成“生成/保存”
];

const current = ref(0);
let timer = null;

// 轮播位移
const trackStyle = computed(() => ({
  transform: `translateX(-${current.value * 100}%)`,
}));

function next() {
  current.value = (current.value + 1) % slides.length;
}

function start() {
  router.push("/styles"); // 按流程进入“选择风格”
}

// 语言按钮先做 UI（后面再接 i18n）
const lang = ref("zh");
const langLabel = computed(() => (lang.value === "zh" ? "简体中文" : "English"));
function toggleLang() {
  lang.value = lang.value === "zh" ? "en" : "zh";
}

onMounted(() => {
  timer = setInterval(next, 3500);
});
onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
  timer = null;
});
</script>

<style scoped>
/* 大屏竖屏：尽量占满，字体/按钮远距离可读 */
.kiosk {
  /* 页面居中显示（开发态） */
  max-width: 1100px;        /* Mac 上舒服的宽度 */
  height: 100vh;
  margin: 0 auto;

  background: #0b0c10;
  color: #fff;

  display: grid;
  grid-template-rows: 1fr auto auto;
  gap: 18px;
  padding: 20px;
  box-sizing: border-box;

  user-select: none;
}


.hero {
  position: relative;
  border-radius: 22px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* 顶部“效果图”标签 */
.tag {
  position: absolute;
  top: 18px;
  left: 18px;
  z-index: 3;
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 18px;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
}

/* 右上语言按钮 */
.lang {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 3;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 16px;
  cursor: pointer;
}

.frame {
  width: 100%;
  height: 100%;
  position: relative;
}

.track {
  height: 100%;
  display: flex;
  transition: transform 400ms ease;
}

.slide {
  min-width: 100%;
  height: 100%;
}

.img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 左下小预览 */
.preview {
  position: absolute;
  left: 16px;
  bottom: 16px;
  width: 140px;
  height: 140px;
  border-radius: 14px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  z-index: 3;
}
.previewImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.startWrap {
  display: flex;
  justify-content: center;
}

.startBtn {
  width: min(820px, 92vw);
  height: 86px;
  border: none;
  border-radius: 18px;
  background: #ffffff;
  color: #0b0c10;
  font-size: 28px;
  font-weight: 800;
  cursor: pointer;
}

/* 底部流程卡片 */
.flow {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}



.card {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.10);
  padding: 14px;
  box-sizing: border-box;
}

.no {
  font-weight: 900;
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 10px;
}

.thumb {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 14px;
  object-fit: cover;
  display: block;
  border: 1px solid rgba(255, 255, 255, 0.10);
}

.title {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 700;
}

/* 适配较小分辨率时缩放一点 */
@media (max-width: 900px) {
  .startBtn {
    height: 64px;
    font-size: 20px;
  }
  .tag {
    font-size: 14px;
  }
  .flow {
    gap: 10px;
  }
}
</style>

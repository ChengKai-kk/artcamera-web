<template>
  <div class="home-page">
    <div class="hero-image" :style="{ backgroundImage: `url(${heroImage})` }" aria-hidden="true"></div>
    <div class="bottom-bg" aria-hidden="true"></div>

    <button class="cta-btn" type="button" @click.stop="start">
      <span class="cta-text">点击屏幕</span>
      <span class="cta-divider" aria-hidden="true"></span>
      <span class="cta-text">开始体验</span>
    </button>

    <div class="hero-title">
      <div class="hero-ai">
        <div class="hero-line hero-line-left" aria-hidden="true"></div>
        <div class="hero-line hero-line-right" aria-hidden="true"></div>
        <div class="hero-ai-text">AI启动</div>
      </div>
      <div class="hero-slogans">
        <div class="hero-slogan-cn">让艺术更有价值</div>
        <div class="hero-slogan-en">MAKE DIGITAL ART MORE VALUABLE</div>
      </div>
    </div>

    <div class="flow-cards">
      <article class="flow-card flow-card-1">
        <div class="card-surface" aria-hidden="true"></div>
        <div class="card-banner">
          <span class="card-number">01.</span>
          <span class="card-title">风格选择</span>
        </div>
        <div class="card-collage">
          <div
            v-for="(item, index) in collageItems"
            :key="item.key"
            class="collage-item"
            :class="`collage-item-${index + 1}`"
            :style="{ backgroundImage: `url(${item.src})` }"
            :aria-label="item.label"
          ></div>
        </div>
        <svg class="card-icon card-icon-hand" viewBox="0 0 128 128" aria-hidden="true">
          <path
            d="M28 20l54 54-22 4 16 34-18 8-16-34-20 16z"
            fill="none"
            stroke="currentColor"
            stroke-width="6"
            stroke-linejoin="round"
          />
        </svg>
      </article>

      <article class="flow-card flow-card-2">
        <div class="card-surface" aria-hidden="true"></div>
        <div class="card-banner">
          <span class="card-number">02.</span>
          <span class="card-title">照片拍摄</span>
        </div>
        <img class="card-main-image" :src="step2" alt="照片拍摄" />
        <div class="thumb-row">
          <div v-for="item in thumbItems" :key="item.label" class="thumb-item">
            <img :src="item.image" class="thumb-img" :alt="item.label" />
            <span class="thumb-text">{{ item.label }}</span>
          </div>
        </div>
        <svg class="card-icon card-icon-scan" viewBox="0 0 100 100" aria-hidden="true">
          <path d="M18 36V18h18" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
          <path d="M64 18h18v18" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
          <path d="M18 64v18h18" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
          <path d="M82 64v18H64" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
          <rect x="34" y="34" width="32" height="32" rx="6" fill="none" stroke="currentColor" stroke-width="6" />
        </svg>
      </article>

      <article class="flow-card flow-card-3">
        <div class="card-surface" aria-hidden="true"></div>
        <div class="card-banner">
          <span class="card-number">03.</span>
          <span class="card-title">照片打印</span>
        </div>
        <img class="card-main-image card-main-image-print" :src="step3" alt="照片打印" />
        <div class="print-btn">打印照片</div>
        <svg class="card-icon card-icon-wand" viewBox="0 0 100 100" aria-hidden="true">
          <line x1="22" y1="78" x2="78" y2="22" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
          <path
            d="M78 12l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"
            fill="none"
            stroke="currentColor"
            stroke-width="4"
            stroke-linejoin="round"
          />
          <path d="M26 26l4 8 8 4-8 4-4 8-4-8-8-4 8-4z" fill="none" stroke="currentColor" stroke-width="3" />
        </svg>
      </article>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

import step1 from "../assets/steps/step-1.webp";
import step2 from "../assets/steps/step-2.webp";
import step3 from "../assets/steps/step-3.webp";

const router = useRouter();
const baseUrl = import.meta.env.BASE_URL;
const heroImage = `${baseUrl}首页图.webp`;

const collageItems = [
  { key: "collage-1", src: step1, label: "风格预览 1" },
  { key: "collage-2", src: `${baseUrl}templates/real_clean_profile.webp`, label: "风格预览 2" },
  { key: "collage-3", src: `${baseUrl}templates/dimension_storybook.webp`, label: "风格预览 3" },
  { key: "collage-4", src: `${baseUrl}styles/retro.webp`, label: "风格预览 4" },
  { key: "collage-5", src: `${baseUrl}styles/dimension.webp`, label: "风格预览 5" },
  { key: "collage-6", src: `${baseUrl}styles/west.webp`, label: "风格预览 6" },
];

const thumbItems = [
  { label: "五官清晰", image: step2 },
  { label: "正视镜头", image: step2 },
  { label: "面无遮挡", image: step2 },
  { label: "光线充足", image: step2 },
];

function start() {
  router.push("/styles");
}
</script>

<style scoped>
.home-page {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #ffffff;
  font-family: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif;
  color: #1f1f1f;
}

.hero-image {
  position: absolute;
  left: 0;
  top: 0;
  width: 2160px;
  height: 2640px;
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  z-index: 1;
}

.bottom-bg {
  position: absolute;
  left: 0;
  top: 2640px;
  width: 2160px;
  height: 1200px;
  background: linear-gradient(180deg, #f7f6f7 0%, #edf2f8 55%, #e2edf7 100%);
  z-index: 1;
}

.bottom-bg::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(520px 520px at 12% 30%, rgba(255, 230, 225, 0.55), transparent 70%),
    radial-gradient(640px 640px at 88% 28%, rgba(214, 232, 255, 0.5), transparent 70%),
    radial-gradient(560px 560px at 80% 78%, rgba(218, 238, 255, 0.45), transparent 70%);
  opacity: 0.8;
}

.hero-title {
  position: absolute;
  left: 624px;
  top: 1778px;
  width: 977px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  z-index: 3;
}

.hero-ai {
  position: relative;
  width: 977px;
  height: 346px;
}

.hero-ai::before {
  content: "";
  position: absolute;
  left: 61px;
  top: 59px;
  width: 916px;
  height: 219px;
  border-radius: 20px;
  background: linear-gradient(90deg, rgba(55, 130, 157, 0) 0%, rgba(55, 130, 157, 0.6) 50%, rgba(55, 130, 157, 0) 100%);
}

.hero-line {
  position: absolute;
  width: 332px;
  height: 72px;
}

.hero-line::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 332px;
  height: 10px;
  border-radius: 20px;
  background: linear-gradient(90deg, rgba(72, 207, 255, 0.6), rgba(72, 207, 255, 1));
}

.hero-line::after {
  content: "";
  position: absolute;
  left: 61px;
  top: 44px;
  width: 268px;
  height: 16px;
  border-radius: 12px;
  background: rgba(72, 207, 255, 1);
}

.hero-line-left {
  left: 0;
  top: 0;
}

.hero-line-right {
  left: 648px;
  top: 286px;
  transform: rotate(180deg);
}

.hero-ai-text {
  position: absolute;
  left: 270px;
  top: 91px;
  font-family: "YouSheBiaoTiHei", "YouSheBiaoTiHei-Regular", "Alibaba PuHuiTi", "PingFang SC", sans-serif;
  font-size: 120px;
  font-weight: 400;
  letter-spacing: 0.4em;
  color: #ffffff;
  text-shadow: 0 0 80px rgba(48, 158, 197, 1);
  -webkit-text-stroke: 4px rgba(29, 172, 223, 1);
}

.hero-slogans {
  width: 881px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.hero-slogan-cn {
  font-family: "ABeeZee", "PingFang SC", sans-serif;
  font-style: italic;
  font-size: 80px;
  letter-spacing: 0.1em;
  color: #ffffff;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 1);
}

.hero-slogan-en {
  font-family: "Alibaba PuHuiTi", "PingFang SC", sans-serif;
  font-weight: 700;
  font-size: 40px;
  color: #ffffff;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 1);
}

.cta-btn {
  position: absolute;
  left: 695px;
  top: 2700px;
  width: 800px;
  height: 170px;
  border-radius: 32px;
  border: none;
  background: #ba1313;
  box-shadow: 0 16px 0 rgba(98, 6, 6, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  cursor: pointer;
  z-index: 4;
}

.cta-text {
  font-size: 80px;
  font-weight: 400;
  color: #ffffff;
}

.cta-divider {
  width: 4px;
  height: 48px;
  background: #ffffff;
  display: inline-block;
}

.flow-cards {
  position: absolute;
  left: 144px;
  top: 2950px;
  width: 1909px;
  height: 790.71px;
  z-index: 4;
}

.flow-card {
  position: absolute;
  top: 0;
  color: #ffffff;
}

.flow-card-1 {
  left: 0;
  width: 633.71px;
  height: 790.71px;
}

.flow-card-2 {
  left: 643px;
  width: 618px;
  height: 770px;
}

.flow-card-3 {
  left: 1286px;
  width: 623px;
  height: 767px;
}

.card-surface {
  position: absolute;
  left: 53px;
  top: 0;
  width: 540px;
  height: 746px;
  border-radius: 40px;
  background: #f2f4f8;
  border: 2px solid #98a2ae;
  box-shadow: 0 18px 28px rgba(0, 0, 0, 0.12);
  z-index: 1;
}

.card-banner {
  position: absolute;
  left: 0;
  top: 49px;
  width: 587px;
  height: 121px;
  border-radius: 28px;
  background: linear-gradient(180deg, #92a7bd, #6f87a2);
  border: 2px solid rgba(88, 102, 118, 0.6);
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 9px 0 0 70px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  z-index: 3;
}

.card-number {
  font-family: "YouSheBiaoTiHei", "YouSheBiaoTiHei-Regular", "PingFang SC", sans-serif;
  font-size: 80px;
  color: #ffffff;
}

.card-title {
  font-size: 64px;
  font-weight: 400;
  color: #ffffff;
}

.card-collage {
  position: absolute;
  left: 103px;
  top: 59px;
  width: 435px;
  height: 621px;
  z-index: 2;
}

.collage-item {
  position: absolute;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
}

.collage-item-1 {
  left: 0;
  top: 0;
  width: 284px;
  height: 408px;
}

.collage-item-2 {
  left: 297px;
  top: 0;
  width: 137px;
  height: 197px;
}

.collage-item-3 {
  left: 297px;
  top: 211px;
  width: 137px;
  height: 197px;
}

.collage-item-4 {
  left: 0;
  top: 424px;
  width: 137px;
  height: 197px;
}

.collage-item-5 {
  left: 149px;
  top: 424px;
  width: 137px;
  height: 197px;
}

.collage-item-6 {
  left: 298px;
  top: 424px;
  width: 137px;
  height: 197px;
}

.card-main-image {
  position: absolute;
  left: 84px;
  top: 59px;
  width: 464px;
  height: 489px;
  border-radius: 16px;
  object-fit: cover;
  z-index: 2;
  max-width: none;
}

.card-main-image-print {
  left: 89px;
  top: 65px;
  width: 463px;
  height: 519px;
  border-radius: 40px;
}

.thumb-row {
  position: absolute;
  left: 116px;
  top: 568px;
  width: 400px;
  height: 112px;
  display: flex;
  gap: 16px;
  z-index: 3;
}

.thumb-item {
  width: 88px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.thumb-img {
  width: 88px;
  height: 88px;
  border-radius: 16px;
  object-fit: cover;
  max-width: none;
}

.thumb-text {
  font-size: 10px;
  color: #000000;
  letter-spacing: 0;
}

.print-btn {
  position: absolute;
  left: 160px;
  top: 600px;
  width: 320px;
  height: 84px;
  border-radius: 24px;
  background: #6f88a4;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Alibaba PuHuiTi", "PingFang SC", sans-serif;
  font-size: 40px;
  font-weight: 700;
  z-index: 3;
}

.card-icon {
  position: absolute;
  color: #1b1b1b;
  z-index: 4;
}

.card-icon-hand {
  width: 141px;
  height: 141px;
  left: 460px;
  top: 670px;
}

.card-icon-scan {
  width: 100px;
  height: 100px;
  left: 465px;
  top: 670px;
}

.card-icon-wand {
  width: 100px;
  height: 100px;
  left: 470px;
  top: 667px;
}
</style>

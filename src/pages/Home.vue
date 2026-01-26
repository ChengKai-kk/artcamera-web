<template>
  <div class="home-page">
    <section class="hero">
      <img :src="heroImage" class="hero-img" alt="hero" />
      <div class="hero-overlay">
        <div class="hero-badge">
          <span class="hero-badge-text">AI 启动</span>
        </div>
        <div class="hero-slogan">让艺术更有价值</div>
        <div class="hero-slogan-en">MAKE DIGITAL ART MORE VALUABLE</div>
      </div>
    </section>

    <section class="flow-panel">
      <div class="start-row">
        <button class="start-btn" type="button" @click.stop="start">
          点击屏幕开始体验
        </button>
      </div>

      <div class="flow-cards">
        <div v-for="step in steps" :key="step.number" class="flow-card">
          <div class="flow-thumb">
            <div class="flow-banner">
              <div class="flow-banner-content">
                <span class="flow-number">{{ step.number }}.</span>
                <span class="flow-title">{{ step.title }}</span>
              </div>
            </div>
            <img :src="step.image" class="flow-img" :alt="step.title" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

import heroImage from "../assets/effects/effect-2.jpg";
import step1 from "../assets/steps/step-1.jpg";
import step2 from "../assets/steps/step-2.jpg";
import step3 from "../assets/steps/step-3.jpg";

const router = useRouter();

const steps = [
  { number: "01", title: "风格选择", image: step1 },
  { number: "02", title: "照片拍摄", image: step2 },
  { number: "03", title: "照片打印", image: step3 },
];

function start() {
  router.push("/styles");
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  height: 100vh;
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-rows: 65fr 35fr;
  align-content: stretch;
  gap: clamp(12px, 1.6vh, 24px);
  position: relative;
  z-index: 1;
}

.hero {
  position: relative;
  border-radius: 28px;
  overflow: hidden;
  border: 2px solid rgba(78, 135, 204, 0.3);
  background: #d8e9ff;
  box-shadow: 0 26px 50px rgba(120, 150, 190, 0.28);
  height: 100%;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding-bottom: clamp(20px, 6vh, 86px);
  transform: translateY(-6%);
  color: #ffffff;
  text-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
}

.hero-badge {
  padding: 20px 68px;
  border-radius: 18px;
  border: 2px dashed rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.2);
  color: #a5d8ff;
  font-weight: 700;
  font-size: clamp(60px, 7.3vh, 140px);
  letter-spacing: 4px;
  line-height: 1.1;
  backdrop-filter: blur(6px);
  position: relative;
  transform: translateY(-14%);
}

.hero-badge::before,
.hero-badge::after {
  content: "";
  position: absolute;
  width: 18px;
  height: 2px;
  background: rgba(255, 255, 255, 0.8);
}

.hero-badge::before {
  top: 10px;
  left: 10px;
}

.hero-badge::after {
  bottom: 10px;
  right: 10px;
}

.hero-badge-text {
  display: inline-block;
}

.hero-slogan {
  font-size: clamp(52px, 6.5vh, 106px);
  font-weight: 800;
}

.hero-slogan-en {
  font-size: clamp(28px, 4vh, 46px);
  letter-spacing: 3px;
  opacity: 0.9;
}

.flow-panel {
  background: linear-gradient(180deg, rgba(249, 239, 229, 0.92), rgba(249, 239, 229, 0.72));
  border: 1px solid rgba(210, 190, 170, 0.45);
  border-radius: 26px;
  padding: clamp(22px, 3.2vh, 38px);
  box-shadow: 0 24px 48px rgba(120, 140, 170, 0.22);
  display: grid;
  height: 100%;
  grid-template-rows: min-content 1fr;
  align-content: start;
  gap: clamp(18px, 2.8vh, 30px);
  justify-items: center;
}

.start-row {
  width: 100%;
  display: grid;
  place-items: center;
  background: transparent;
  border-radius: 0;
  padding: 0;
  border: none;
}

.start-btn {
  width: min(1040px, 96%);
  margin: 0 auto;
  height: clamp(92px, 11vh, 160px);
  border: none;
  border-radius: 22px;
  background: linear-gradient(135deg, #cf2a32, #b81d27);
  color: #ffffff;
  font-size: clamp(50px, 6.5vh, 80px);
  font-weight: 800;
  letter-spacing: 1.4px;
  cursor: pointer;
  box-shadow: 0 20px 42px rgba(206, 42, 50, 0.32);
}

.flow-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(18px, 2.6vh, 26px);
  width: 100%;
  background: transparent;
  border-radius: 0;
  padding: 0;
  border: none;
}

.flow-card {
  position: relative;
  border-radius: 20px;
  padding: clamp(18px, 2.6vh, 28px);
  background: #f4f6f9;
  border: 1px solid rgba(160, 170, 185, 0.4);
  box-shadow: 0 16px 32px rgba(120, 140, 170, 0.18);
  display: grid;
  gap: 12px;
  align-content: start;
  text-align: center;
  height: 100%;
}

.flow-thumb {
  position: relative;
  border-radius: 14px;
  background: #f6f7f9;
  padding: clamp(12px, 1.6vh, 22px);
  border: 2px solid #b9bec6;
  display: grid;
  gap: clamp(10px, 1.4vh, 16px);
  grid-template-rows: auto 1fr;
  overflow: hidden;
  height: 100%;
}

.flow-banner {
  width: 100%;
  background: linear-gradient(180deg, #dde1e6, #d2d7dd);
  border: 1px solid #b4bac3;
  border-radius: 10px;
  padding: clamp(10px, 1.6vh, 18px) clamp(16px, 2.4vh, 28px);
  transform: skewX(-12deg);
  box-shadow: 0 6px 14px rgba(120, 130, 150, 0.18);
  justify-self: center;
}

.flow-banner-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transform: skewX(12deg);
  text-align: center;
}

.flow-number {
  font-weight: 800;
  font-size: clamp(32px, 4vh, 48px);
  color: #4a5565;
}

.flow-title {
  font-weight: 700;
  font-size: clamp(30px, 3.6vh, 44px);
  color: #2f3134;
}

.flow-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
  background: #eef2f7;
  border: 1px solid rgba(160, 170, 185, 0.35);
}

@media (max-width: 720px) {
  .flow-cards {
    grid-template-columns: 1fr;
  }
}

@media (orientation: portrait) and (min-height: 2400px) {
  .flow-card {
    border-radius: 24px;
  }
  .flow-img {
    height: 100%;
  }
}
</style>

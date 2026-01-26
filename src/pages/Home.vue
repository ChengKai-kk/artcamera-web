<template>
  <div class="home-page" @click="start">
    <section class="hero" @click.stop="start">
      <img :src="heroImage" class="hero-img" alt="hero" />
      <div class="hero-overlay">
        <div class="hero-badge">
          <span class="hero-badge-text">AI 启动</span>
        </div>
        <div class="hero-slogan">让艺术更有价值</div>
        <div class="hero-slogan-en">MAKE DIGITAL ART MORE VALUABLE</div>
      </div>
    </section>

    <section class="flow-panel" @click.stop="start">
      <button class="start-btn" type="button" @click.stop="start">
        点击屏幕开始体验
      </button>

      <div class="flow-cards">
        <div v-for="step in steps" :key="step.number" class="flow-card">
          <div class="flow-header">
            <span class="flow-number">{{ step.number }}.</span>
            <span class="flow-title">{{ step.title }}</span>
          </div>
          <div class="flow-thumb">
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
  width: min(var(--site-max-width), 94vw);
  margin: 0 auto;
  padding: var(--site-gap);
  display: grid;
  grid-template-rows: minmax(340px, 1fr) auto;
  gap: clamp(14px, 2.4vh, 28px);
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
  min-height: clamp(520px, 58vh, 1180px);
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
  padding: 16px 54px;
  border-radius: 18px;
  border: 2px dashed rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.2);
  color: #a5d8ff;
  font-weight: 700;
  font-size: clamp(30px, 3.7vh, 68px);
  letter-spacing: 4px;
  line-height: 1.1;
  backdrop-filter: blur(6px);
  position: relative;
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
  font-size: clamp(34px, 4.4vh, 70px);
  font-weight: 800;
}

.hero-slogan-en {
  font-size: clamp(18px, 2.6vh, 32px);
  letter-spacing: 3px;
  opacity: 0.9;
}

.flow-panel {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(80, 140, 210, 0.25);
  border-radius: 26px;
  padding: clamp(22px, 3.2vh, 38px);
  box-shadow: 0 24px 48px rgba(120, 140, 170, 0.22);
  display: grid;
  gap: clamp(18px, 2.8vh, 30px);
  justify-items: center;
}

.start-btn {
  width: min(920px, 92%);
  margin: 0 auto;
  height: clamp(72px, 8.4vh, 120px);
  border: none;
  border-radius: 22px;
  background: linear-gradient(135deg, #cf2a32, #b81d27);
  color: #ffffff;
  font-size: clamp(26px, 3.2vh, 42px);
  font-weight: 800;
  letter-spacing: 1.2px;
  cursor: pointer;
  box-shadow: 0 20px 42px rgba(206, 42, 50, 0.32);
}

.flow-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(18px, 2.6vh, 26px);
  width: 100%;
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
}

.flow-header {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #e4e7ec;
  border-radius: 999px;
  padding: 8px 16px;
  width: fit-content;
  margin: 0 auto;
}

.flow-number {
  font-weight: 800;
  font-size: clamp(22px, 2.8vh, 34px);
  color: #4a5565;
}

.flow-title {
  font-weight: 700;
  font-size: clamp(20px, 2.4vh, 30px);
  color: #2f3134;
}

.flow-thumb {
  border-radius: 16px;
  background: #ffffff;
  padding: 10px;
  border: 1px solid rgba(160, 170, 185, 0.35);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
}

.flow-img {
  width: 100%;
  height: clamp(150px, 16vh, 240px);
  object-fit: cover;
  border-radius: 12px;
  background: #eef2f7;
}

@media (max-width: 720px) {
  .home-page {
    grid-template-rows: minmax(300px, 1fr) auto;
  }
  .flow-cards {
    grid-template-columns: 1fr;
  }
}

@media (orientation: portrait) and (min-height: 2400px) {
  .hero {
    min-height: clamp(760px, 68vh, 1500px);
  }
  .flow-card {
    border-radius: 24px;
  }
  .flow-img {
    height: clamp(160px, 14vh, 240px);
  }
}
</style>

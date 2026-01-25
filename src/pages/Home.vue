<template>
  <div class="home-page" @click="start">
    <section class="hero" @click.stop="start">
      <img :src="heroImage" class="hero-img" alt="hero" />
      <div class="hero-overlay">
        <div class="hero-badge">AI 启动</div>
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
            <span class="flow-number">{{ step.number }}</span>
            <span class="flow-title">{{ step.title }}</span>
          </div>
          <img :src="step.image" class="flow-img" :alt="step.title" />
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
  border: 1px solid rgba(78, 135, 204, 0.35);
  background: #d8e9ff;
  box-shadow: 0 26px 50px rgba(120, 150, 190, 0.28);
  min-height: clamp(420px, 56vh, 980px);
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
  gap: 12px;
  padding-bottom: clamp(16px, 5.4vh, 78px);
  transform: translateY(-10%);
  color: #ffffff;
  text-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
}

.hero-badge {
  padding: 20px 50px;
  border-radius: 20px;
  border: 2px dashed rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.18);
  color: #9ad3ff;
  font-weight: 700;
  font-size: clamp(30px, 3.6vh, 66px);
  letter-spacing: 3px;
  line-height: 1.1;
  backdrop-filter: blur(6px);
}

.hero-slogan {
  font-size: clamp(32px, 4.2vh, 64px);
  font-weight: 800;
}

.hero-slogan-en {
  font-size: clamp(18px, 2.5vh, 30px);
  letter-spacing: 3.2px;
  opacity: 0.95;
}

.flow-panel {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(80, 140, 210, 0.28);
  border-radius: 24px;
  padding: clamp(20px, 3vh, 34px);
  box-shadow: 0 20px 44px rgba(120, 140, 170, 0.2);
  display: grid;
  gap: clamp(16px, 2.6vh, 28px);
  justify-items: center;
}

.start-btn {
  width: min(860px, 90%);
  margin: 0 auto;
  height: clamp(68px, 8vh, 110px);
  border: none;
  border-radius: 20px;
  background: linear-gradient(135deg, #cf2a32, #b81d27);
  color: #ffffff;
  font-size: clamp(24px, 3.1vh, 40px);
  font-weight: 800;
  letter-spacing: 1.5px;
  cursor: pointer;
  box-shadow: 0 20px 42px rgba(206, 42, 50, 0.32);
}

.flow-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(16px, 2.6vh, 24px);
  width: 100%;
}

.flow-card {
  position: relative;
  border-radius: 20px;
  padding: clamp(16px, 2.4vh, 26px);
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(80, 140, 210, 0.25);
  box-shadow: 0 18px 34px rgba(120, 140, 170, 0.22);
  display: grid;
  gap: 10px;
  align-content: start;
  text-align: center;
  justify-items: center;
}

.flow-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.flow-number {
  font-weight: 800;
  font-size: clamp(22px, 3vh, 36px);
  color: #4f6b8f;
}

.flow-title {
  font-weight: 700;
  font-size: clamp(20px, 2.6vh, 32px);
  color: #2d2f33;
}

.flow-img {
  width: 100%;
  height: clamp(130px, 16vh, 240px);
  object-fit: contain;
  border-radius: 14px;
  background: #f0f4fb;
  border: 1px solid rgba(80, 140, 210, 0.2);
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
    min-height: clamp(720px, 66vh, 1400px);
  }
  .flow-card {
    border-radius: 24px;
  }
  .flow-img {
    height: clamp(120px, 12vh, 200px);
  }
}
</style>

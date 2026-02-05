<template>
  <div class="home-page" @click="start">
    <div class="hero-carousel" aria-label="首页轮播">
      <div
        class="carousel-track"
        :style="{ WebkitMaskImage: `url(${carouselMask})`, maskImage: `url(${carouselMask})` }"
      >
        <img
          v-for="(slide, index) in slides"
          :key="slide"
          class="carousel-slide"
          :class="{ active: index === currentSlide }"
          :src="slide"
          :alt="`轮播图 ${index + 1}`"
        />
      </div>
      <img class="carousel-frame" :src="carouselFrame" alt="" aria-hidden="true" />
      <div class="carousel-dots" role="tablist" aria-label="轮播切换">
        <button
          v-for="(slide, index) in slides"
          :key="`dot-${slide}`"
          class="carousel-dot"
          :class="{ active: index === currentSlide }"
          type="button"
          :aria-label="`切换到第${index + 1}张`"
          @click.stop="goToSlide(index)"
        ></button>
      </div>
    </div>

    <img class="bottom-bg" :src="bottomBg" alt="" aria-hidden="true" />
    <img class="guide-image" :src="guideImage" alt="玩法说明" />

    <button class="cta-btn" type="button" @click.stop="start" aria-label="开始体验">
      <img :src="ctaImage" alt="点击屏幕 开始体验" />
    </button>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import bottomBg from "../assets/home/home-bottom.webp";
import ctaImage from "../assets/home/home-cta.webp";
import guideImage from "../assets/home/home-guide.webp";
import carouselFrame from "../assets/home/home-frame.webp";
import carouselMask from "../assets/home/home-slide-mask.webp";
import slide1 from "../assets/home/home-slide-1.webp";
import slide2 from "../assets/home/home-slide-2.webp";
import slide3 from "../assets/home/home-slide-3.webp";
import slide4 from "../assets/home/home-slide-4.webp";
import slide5 from "../assets/home/home-slide-5.webp";

const router = useRouter();
const slides = [slide1, slide2, slide3, slide4, slide5];
const currentSlide = ref(0);
let timerId = null;

function startAutoPlay() {
  stopAutoPlay();
  timerId = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.length;
  }, 3500);
}

function stopAutoPlay() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function goToSlide(index) {
  if (index === currentSlide.value) return;
  currentSlide.value = index;
  startAutoPlay();
}

function start() {
  router.push("/styles");
}

onMounted(() => {
  startAutoPlay();
});

onBeforeUnmount(() => {
  stopAutoPlay();
});
</script>

<style scoped>
.home-page {
  width: 2160px;
  height: 3840px;
  position: relative;
  overflow: hidden;
  background: #ffffff;
  font-family: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif;
  color: #1f1f1f;
  cursor: pointer;
}

.hero-carousel {
  position: absolute;
  left: 0;
  top: 0;
  width: 2160px;
  height: 2640px;
  z-index: 1;
  overflow: hidden;
}

.carousel-track {
  position: absolute;
  inset: 0;
  -webkit-mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-size: 100% 100%;
  mask-repeat: no-repeat;
  mask-position: center;
}

.carousel-slide {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 600ms ease;
}

.carousel-slide.active {
  opacity: 1;
}

.carousel-frame {
  position: absolute;
  left: 588px;
  top: 1750px;
  width: 984px;
  height: 548px;
  z-index: 3;
  pointer-events: none;
  display: block;
}

.carousel-dots {
  position: absolute;
  left: 50%;
  top: 2340px;
  transform: translateX(-50%);
  width: 240px;
  display: flex;
  gap: 12px;
  justify-content: center;
  z-index: 4;
}

.carousel-dot {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
}

.carousel-dot.active {
  background: #ffffff;
}

.bottom-bg {
  position: absolute;
  left: 0;
  top: 2640px;
  width: 2160px;
  height: 1200px;
  z-index: 1;
  pointer-events: none;
  object-fit: cover;
  display: block;
}

.guide-image {
  position: absolute;
  left: 144px;
  top: 2950px;
  width: 1909px;
  height: 794px;
  z-index: 3;
  display: block;
}

.cta-btn {
  position: absolute;
  left: 695px;
  top: 2700px;
  width: 800px;
  height: 186px;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  z-index: 4;
}

.cta-btn img {
  width: 100%;
  height: 100%;
  display: block;
}
</style>

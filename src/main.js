import { createApp } from 'vue'
import './styles/global.css'
import App from './App.vue'
import router from "./router";

const DESIGN_WIDTH = 2160;
const DESIGN_HEIGHT = 3840;

const root = document.documentElement;
let resizeRaf = 0;

const updateScale = () => {
  resizeRaf = 0;
  const scale = Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT);
  root.style.setProperty('--scale', scale.toString());
};

const scheduleScaleUpdate = () => {
  if (resizeRaf) cancelAnimationFrame(resizeRaf);
  resizeRaf = requestAnimationFrame(updateScale);
};

updateScale();
window.addEventListener('resize', scheduleScaleUpdate, { passive: true });
window.addEventListener('orientationchange', scheduleScaleUpdate, { passive: true });


createApp(App).use(router).mount("#app");

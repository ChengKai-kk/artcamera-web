// src/router/index.js
import { createRouter, createWebHashHistory } from "vue-router";

import Home from "../pages/Home.vue";
import StyleSelect from "../pages/StyleSelect.vue";
import TemplateSelect from "../pages/TemplateSelect.vue";
import ModeSelect from "../pages/ModeSelect.vue";
import Camera from "../pages/Camera.vue";
import Generate from "../pages/Generate.vue";
import Save from "../pages/Save.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/styles", name: "styles", component: StyleSelect },
  { path: "/templates", name: "templates", component: TemplateSelect },
  { path: "/mode", name: "mode", component: ModeSelect },
  { path: "/camera", name: "camera", component: Camera },
  { path: "/generate", name: "generate", component: Generate },
  { path: "/save", name: "save", component: Save },
];

const router = createRouter({
  // 关键：GitHub Pages 部署在 /artcamera-web/ 下
  history: createWebHashHistory("/artcamera-web/"),
  routes,
});

export default router;

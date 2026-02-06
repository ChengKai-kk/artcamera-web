<template>
  <div
    class="app-viewport"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
    @click.capture="onClickCapture"
    @contextmenu="onContextMenu"
  >
    <div class="app-stage-wrap">
      <div class="app-stage">
        <router-view />
      </div>
    </div>

    <SystemActionSheet
      v-if="hasDesktopApi"
      :open="actionSheetOpen"
      :is-fullscreen="isFullscreen"
      @close="closeActionSheet"
      @toggle-fullscreen="toggleFullscreen"
      @quit="quitApp"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import SystemActionSheet from "./components/SystemActionSheet.vue";

const LONG_PRESS_MS = 1800;
const MOVE_CANCEL_PX = 12;

const actionSheetOpen = ref(false);
const isFullscreen = ref(false);
const suppressNextClick = ref(false);

let longPressTimer = null;
let suppressClickTimer = null;
let activePointerId = null;
let startX = 0;
let startY = 0;

const hasDesktopApi = computed(() => {
  if (typeof window === "undefined") return false;
  const api = window.artcamera;
  return (
    api &&
    typeof api.setFullscreen === "function" &&
    typeof api.isFullscreen === "function" &&
    typeof api.quit === "function"
  );
});

function clearLongPress() {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  activePointerId = null;
}

function armSuppressNextClick() {
  suppressNextClick.value = true;
  if (suppressClickTimer) {
    clearTimeout(suppressClickTimer);
    suppressClickTimer = null;
  }
  suppressClickTimer = setTimeout(() => {
    suppressNextClick.value = false;
    suppressClickTimer = null;
  }, 1000);
}

async function openActionSheet() {
  if (!hasDesktopApi.value) return;
  if (actionSheetOpen.value) return;

  clearLongPress();

  actionSheetOpen.value = true;

  try {
    isFullscreen.value = await window.artcamera.isFullscreen();
  } catch (error) {
    isFullscreen.value = false;
  }
}

function closeActionSheet() {
  actionSheetOpen.value = false;
}

async function toggleFullscreen() {
  if (!hasDesktopApi.value) return;

  const next = !isFullscreen.value;
  try {
    await window.artcamera.setFullscreen(next);
    isFullscreen.value = next;
  } catch (error) {
    // ignore
  }

  closeActionSheet();
}

async function quitApp() {
  if (!hasDesktopApi.value) return;
  try {
    await window.artcamera.quit();
  } catch (error) {
    // ignore
  }
}

function shouldTrackLongPress(event) {
  if (!hasDesktopApi.value) return false;
  if (actionSheetOpen.value) return false;
  if (event && event.isPrimary === false) return false;
  if (typeof event.button === "number" && event.button !== 0) return false;
  return true;
}

function onPointerDown(event) {
  if (!shouldTrackLongPress(event)) return;

  clearLongPress();
  activePointerId = event.pointerId;
  startX = event.clientX;
  startY = event.clientY;

  longPressTimer = setTimeout(() => {
    armSuppressNextClick();
    openActionSheet();
  }, LONG_PRESS_MS);
}

function onPointerMove(event) {
  if (!longPressTimer) return;
  if (activePointerId !== null && event.pointerId !== activePointerId) return;

  const dx = event.clientX - startX;
  const dy = event.clientY - startY;
  if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) {
    clearLongPress();
  }
}

function onPointerUp(event) {
  if (activePointerId !== null && event.pointerId !== activePointerId) return;
  clearLongPress();
}

function onPointerCancel(event) {
  if (activePointerId !== null && event.pointerId !== activePointerId) return;
  clearLongPress();
}

function onClickCapture(event) {
  if (!suppressNextClick.value) return;
  suppressNextClick.value = false;
  if (suppressClickTimer) {
    clearTimeout(suppressClickTimer);
    suppressClickTimer = null;
  }
  event.preventDefault();
  event.stopPropagation();
}

function onContextMenu(event) {
  if (!hasDesktopApi.value) return;
  event.preventDefault();
}

onBeforeUnmount(() => {
  clearLongPress();
  if (suppressClickTimer) {
    clearTimeout(suppressClickTimer);
    suppressClickTimer = null;
  }
});
</script>

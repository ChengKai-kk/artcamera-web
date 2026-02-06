<template>
  <teleport to="body">
    <div
      v-if="open"
      class="system-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="系统菜单"
      @click="emitClose"
    >
      <div class="system-sheet__panel" @click.stop>
        <div class="system-sheet__title">系统菜单</div>

        <button class="system-sheet__btn system-sheet__btn--primary" type="button" @click="emitToggle">
          {{ isFullscreen ? "退出全屏" : "进入全屏" }}
        </button>
        <button class="system-sheet__btn system-sheet__btn--danger" type="button" @click="emitQuit">
          退出应用
        </button>
        <button class="system-sheet__btn" type="button" @click="emitClose">取消</button>
      </div>
    </div>
  </teleport>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  isFullscreen: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "toggleFullscreen", "quit"]);

function emitClose() {
  emit("close");
}

function emitToggle() {
  emit("toggleFullscreen");
}

function emitQuit() {
  emit("quit");
}
</script>

<style scoped>
.system-sheet {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(10, 14, 22, 0.46);
  backdrop-filter: blur(10px);
}

.system-sheet__panel {
  width: min(560px, 88vw);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 26px 70px rgba(0, 0, 0, 0.36);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.system-sheet__title {
  font-size: 18px;
  font-weight: 800;
  color: rgba(30, 30, 30, 0.88);
  letter-spacing: 0.2px;
  padding: 6px 8px 10px;
}

.system-sheet__btn {
  width: 100%;
  min-height: 64px;
  padding: 14px 18px;
  border-radius: 16px;
  border: 1px solid rgba(30, 40, 60, 0.18);
  background: rgba(245, 247, 251, 0.9);
  font-size: 20px;
  font-weight: 800;
  color: rgba(20, 20, 20, 0.9);
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
}

.system-sheet__btn:active {
  transform: translateY(1px) scale(0.99);
}

.system-sheet__btn--primary {
  background: linear-gradient(135deg, rgba(74, 164, 255, 0.96), rgba(55, 124, 255, 0.96));
  color: #ffffff;
  border-color: rgba(75, 150, 255, 0.25);
  box-shadow: 0 16px 30px rgba(55, 124, 255, 0.26);
}

.system-sheet__btn--danger {
  background: linear-gradient(135deg, rgba(207, 42, 50, 0.96), rgba(184, 29, 39, 0.96));
  color: #ffffff;
  border-color: rgba(207, 42, 50, 0.2);
  box-shadow: 0 16px 30px rgba(207, 42, 50, 0.22);
}
</style>


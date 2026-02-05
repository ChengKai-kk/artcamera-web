<template>
  <div class="flip-digit" :class="{ 'is-flipping': flipping }" aria-hidden="true">
    <div class="card">
      <div class="half upper">
        <span class="digit">{{ displayDigit }}</span>
      </div>
      <div class="half lower">
        <span class="digit">{{ displayDigit }}</span>
      </div>

      <div v-if="flipping" class="flip-half flip-upper">
        <span class="digit">{{ displayDigit }}</span>
      </div>
      <div v-if="flipping" class="flip-half flip-lower">
        <span class="digit">{{ displayDigit }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";

const props = defineProps({
  value: { type: String, required: true },
});

const current = ref(props.value);
const next = ref(props.value);
const flipping = ref(false);
const showNext = ref(false);
const displayDigit = computed(() => (showNext.value ? next.value : current.value));
const pending = ref(null);
let flipTimer = null;
let midTimer = null;

function clearFlipTimer() {
  if (flipTimer) {
    clearTimeout(flipTimer);
    flipTimer = null;
  }
  if (midTimer) {
    clearTimeout(midTimer);
    midTimer = null;
  }
}

function startFlip(v) {
  clearFlipTimer();
  next.value = v;
  flipping.value = true;
  showNext.value = false;

  // Swap the static halves exactly when the flaps are edge-on (300ms),
  // so the digit never appears "top new / bottom old".
  midTimer = setTimeout(() => {
    showNext.value = true;
  }, 300);

  flipTimer = setTimeout(() => {
    current.value = next.value;
    flipping.value = false;
    showNext.value = false;
    const p = pending.value;
    pending.value = null;
    if (p != null && p !== current.value) {
      startFlip(p);
    }
  }, 620);
}

watch(
  () => props.value,
  (v) => {
    if (v === current.value) return;
    if (flipping.value) {
      pending.value = v;
      return;
    }
    startFlip(v);
  }
);

onBeforeUnmount(() => {
  clearFlipTimer();
});
</script>

<style scoped>
.flip-digit {
  width: var(--flip-digit-w, 280px);
  height: var(--flip-digit-h, 380px);
  perspective: 1200px;
}

.card {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 28px;
  overflow: hidden;
  background: linear-gradient(180deg, #1e222a, #12151b);
  box-shadow:
    0 18px 44px rgba(0, 0, 0, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.card::after {
  content: "";
  position: absolute;
  left: 10px;
  right: 10px;
  top: 50%;
  height: 2px;
  transform: translateY(-1px);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.18), transparent);
  pointer-events: none;
  z-index: 6;
}

.half,
.flip-half {
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  overflow: hidden;
  display: grid;
  place-items: center;
}

.upper {
  top: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(0, 0, 0, 0));
}

.lower {
  bottom: 0;
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.04), rgba(0, 0, 0, 0));
}

.digit {
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  font-family: "Alibaba PuHuiTi", "PingFang SC", "Microsoft YaHei", sans-serif;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: #f7f9ff;
  text-shadow: 0 10px 22px rgba(0, 0, 0, 0.45);
  font-size: calc(var(--flip-digit-h, 380px) * 0.68);
}

.upper .digit,
.flip-upper .digit {
  top: 100%;
  transform: translateY(-50%);
}

.lower .digit,
.flip-lower .digit {
  top: 0%;
  transform: translateY(-50%);
}

.flip-upper {
  top: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(0, 0, 0, 0));
  transform-origin: bottom;
  transform: rotateX(-90deg);
  backface-visibility: hidden;
  z-index: 5;
  will-change: transform;
}

.flip-lower {
  bottom: 0;
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.04), rgba(0, 0, 0, 0));
  transform-origin: top;
  transform: rotateX(0deg);
  backface-visibility: hidden;
  z-index: 4;
  will-change: transform;
}

.is-flipping .flip-upper {
  animation: flipUpperIn 300ms cubic-bezier(0.2, 0.7, 0.2, 1) 300ms forwards;
}

.is-flipping .flip-lower {
  animation: flipLowerOut 300ms cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
}

@keyframes flipLowerOut {
  0% {
    transform: rotateX(0deg);
    filter: brightness(1);
  }
  100% {
    transform: rotateX(90deg);
    filter: brightness(0.85);
  }
}

@keyframes flipUpperIn {
  0% {
    transform: rotateX(-90deg);
    filter: brightness(0.85);
  }
  100% {
    transform: rotateX(0deg);
    filter: brightness(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .is-flipping .flip-upper,
  .is-flipping .flip-lower {
    animation: none;
  }
}
</style>

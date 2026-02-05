<template>
  <div class="flip-counter" role="img" :aria-label="`计时 ${label}`">
    <FlipDigit v-for="(ch, idx) in chars" :key="idx" :value="ch" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import FlipDigit from "./FlipDigit.vue";

const props = defineProps({
  value: { type: Number, required: true },
  digits: { type: Number, default: 2 },
});

const label = computed(() => String(props.value).padStart(props.digits, "0"));

const chars = computed(() => {
  const s = label.value;
  return s.split("");
});
</script>

<style scoped>
.flip-counter {
  display: flex;
  gap: var(--flip-gap, 56px);
  align-items: center;
  justify-content: center;
}
</style>


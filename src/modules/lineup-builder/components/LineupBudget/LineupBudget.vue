<template>
  <div class="w-full font-medium">
    <div class="hidden md:block">
      <p class="text-center text-sm">
        <span> {{ currency.formatter(animatedSpent) }} </span>
        <span> / {{ currency.formatter(budget) }}</span>
        <q-icon
          name="las la-circle"
          size="2px"
          color="dark"
          class="inline-block mx-2 bg-dark rounded-full"
        />
        <span :class="textColor">{{ currency.formatter(animatedRemaining) }} {{ statusText }}</span>
      </p>
    </div>
    <div class="w-full relative bg-CB-100 rounded-full h-5 max-w-[300px] m-auto">
      <div
        class="h-full rounded-full transition-all duration-500 ease-out"
        :class="progressBarColor"
        :style="{ width: `${percentage}%` }"
      />
      <span
        class="absolute top-0 left-0 right-0 text-center text-text-default text-xs font-semibold leading-5 pointer-events-none"
        >{{ percentage }}%</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { animate } from 'motion-v';
import { storeToRefs } from 'pinia';
import { useLineupStore } from 'stores/useLineupStore';

const lineupStore = useLineupStore();
const { budget, remaining, spent, percentage, isExceeded, currency } = storeToRefs(lineupStore);

const animatedSpent = ref(spent.value);
const animatedRemaining = ref(budget.value - spent.value);

const statusText = computed(() => (isExceeded.value ? 'Excedido' : 'Restantes'));

const progressBarColor = computed(() => {
  if (isExceeded.value) {
    return 'bg-red-500';
  }
  if (percentage.value > 75) {
    return 'bg-yellow-500';
  }

  return 'bg-primary';
});

const textColor = computed(() => {
  if (isExceeded.value) {
    return 'text-red-500';
  }
  if (percentage.value > 75) {
    return 'text-yellow-500';
  }
  return 'text-Extended-Text';
});

watch(remaining, (newValue, oldValue) => {
  animate(oldValue, newValue, {
    duration: 0.5,
    onUpdate: (value) => {
      animatedRemaining.value = value;
    },
  });
});

watch(spent, (newValue, oldValue) => {
  animate(oldValue, newValue, {
    duration: 0.5,
    onUpdate: (value) => {
      animatedSpent.value = value;
    },
  });
});
</script>

<style scoped>
/* Using Tailwind CSS classes, no custom styles needed here */
</style>

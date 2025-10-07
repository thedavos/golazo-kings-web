<template>
  <div
    v-if="shouldShowAds"
    ref="adContainerRef"
    class="w-full my-4 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg"
  >
    <div class="text-[10px] uppercase text-gray-500 dark:text-gray-400 text-center mb-2 font-semibold tracking-wide">Publicidad</div>
    <google-adsense
      v-if="isVisible"
      :client-id="config.clientId"
      :slot-id="config.inFeedSlotId"
      :ad-style="adStyle"
      format="fluid"
      layout-key="-6t+ed+2i-1n-4w"
      full-width-responsive="true"
    />
    <div v-else class="w-full min-h-[100px]">
      <q-skeleton height="120px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAds } from '../composables/useAds';
import GoogleAdsense from './GoogleAdsense.vue';

const { config, shouldShowAds } = useAds();

const adContainerRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);

const adStyle = computed(() => {
  return 'display: block; min-height: 100px; max-height: 250px;';
});

let observer: IntersectionObserver | null = null;

onMounted(() => {
  // Lazy loading: solo cargar el ad cuando esté visible en viewport
  if (adContainerRef.value && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible.value) {
            isVisible.value = true;
            // Una vez visible, desconectar el observer
            if (observer) {
              observer.disconnect();
            }
          }
        });
      },
      {
        rootMargin: '50px', // Cargar 50px antes de que sea visible
        threshold: 0.1,
      }
    );

    observer.observe(adContainerRef.value);
  } else {
    // Fallback si no hay IntersectionObserver
    isVisible.value = true;
  }
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>


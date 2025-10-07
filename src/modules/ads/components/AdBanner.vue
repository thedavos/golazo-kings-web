<template>
  <transition
    appear
    enter-active-class="animated slideInUp"
    leave-active-class="animated slideOutDown"
  >
    <div v-if="shouldShowAds && !isClosed" :class="containerClass">
      <q-btn
        flat
        round
        dense
        size="sm"
        icon="la la-times"
        class="absolute top-1 right-1 z-[1001]"
        aria-label="Cerrar anuncio"
        @click="closeAd"
      />
      <google-adsense
        :client-id="config.clientId"
        :slot-id="config.bannerSlotId"
        :ad-style="adStyle"
        format="100%"
        full-width-responsive="true"
      />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAds } from 'src/modules/ads/composables/useAds';
import GoogleAdsense from './GoogleAdsense.vue';

interface Props {
  closeable?: boolean;
  height?: 'small' | 'medium' | 'large' | 'auto';
}

const props = withDefaults(defineProps<Props>(), {
  closeable: true,
  height: 'medium',
});

const { config, shouldShowAds } = useAds();
const isClosed = ref(false);

const containerClass = computed(() => {
  const baseClass =
    'relative w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-[0_-2px_8px_rgba(0,0,0,0.1)] overflow-hidden z-[100]';

  const heightClasses = {
    small: 'max-h-[94px]', // 90px ad + 4px padding
    medium: 'max-h-[128px]', // 120px ad + 8px padding
    large: 'max-h-[266px]', // 250px ad + 16px padding
    auto: '', // Sin restricción
  };

  const paddingClass = props.height === 'small' ? 'p-1' : 'p-2';
  const heightClass = heightClasses[props.height];

  return `${baseClass} ${paddingClass} ${heightClass}`;
});
//
const adStyle = computed(() => {
  const heights = {
    small: 'display: block; min-height: 50px; max-height: 90px;', // Compatible con 728x90 y 320x50
    medium: 'display: block; min-height: 90px; max-height: 120px;', // Más espacio
    large: 'display: block; min-height: 120px; max-height: 250px;', // Ads grandes
    auto: 'display: block; height: auto;', // Se ajusta al contenido
  };
  return heights[props.height];
});
//
const closeAd = () => {
  isClosed.value = true;
};
</script>

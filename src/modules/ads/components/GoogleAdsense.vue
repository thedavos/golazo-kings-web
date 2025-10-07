<template>
  <div class="adsense-container">
    <component async :is="'script'" :src="scriptSrc" crossorigin="anonymous" />
    <ins
      class="adsbygoogle"
      :style="adStyle"
      :data-ad-client="clientId"
      :data-ad-slot="slotId"
      :data-ad-format="format"
      :data-ad-layout-key="layoutKey"
      :data-ad-layout="layout"
      :data-full-width-responsive="fullWidthResponsive"
    />
    <component :is="'script'"> (adsbygoogle = window.adsbygoogle || []).push({}); </component>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  adStyle?: string;
  clientId: string;
  slotId: string;
  format?: string;
  fullWidthResponsive?: string;
  layoutKey?: string;
  layout?: string;
}

const props = withDefaults(defineProps<Props>(), {
  adStyle: 'display: block',
  format: 'auto',
  fullWidthResponsive: 'true',
  layoutKey: '',
  layout: '',
});

const scriptSrc = computed(() => {
  return `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${props.clientId}`;
});
</script>

<style scoped>
.adsense-container {
  width: 100%;
  overflow: hidden;
}
</style>

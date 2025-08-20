import { ref } from 'vue';
import { createSharedComposable } from '@vueuse/core';

function useMainLayout() {
  const drawerLeft = ref(false);
  const drawerRight = ref(false);

  return {
    drawerLeft,
    drawerRight,
  };
}

export const useSharedMainLayout = createSharedComposable(useMainLayout);

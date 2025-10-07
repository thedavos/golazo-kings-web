import { computed } from 'vue';
import { useGoogleConsent } from './useGoogleConsent';

export interface AdsConfig {
  clientId: string;
  bannerSlotId: string;
  inFeedSlotId: string;
  enabled: boolean;
}

/**
 * Composable para gestionar la configuración de Google AdSense
 * Incluye verificación de consentimiento GDPR
 */
export function useAds() {
  // Leer variables de entorno
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID || '';
  const bannerSlotId = import.meta.env.VITE_ADSENSE_SLOT_BANNER || '';
  const inFeedSlotId = import.meta.env.VITE_ADSENSE_SLOT_INFEED || '';
  const enabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true';

  // Obtener estado del consentimiento
  const { areAdsAllowed, hasUserConsent } = useGoogleConsent();

  // Verificar si la configuración es válida
  const isConfigured = computed(() => {
    return !!(clientId && bannerSlotId && inFeedSlotId);
  });

  // Verificar si los ads deben mostrarse
  // IMPORTANTE: Solo mostrar ads si:
  // 1. Están habilitados en env
  // 2. La configuración es válida
  // 3. El usuario ha dado consentimiento Y permite ads
  const shouldShowAds = computed(() => {
    return enabled && isConfigured.value && hasUserConsent.value && areAdsAllowed.value;
  });

  const config: AdsConfig = {
    clientId,
    bannerSlotId,
    inFeedSlotId,
    enabled,
  };

  return {
    config,
    isConfigured,
    shouldShowAds,
    hasUserConsent,
    areAdsAllowed,
  };
}

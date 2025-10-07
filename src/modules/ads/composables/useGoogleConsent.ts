import { ref, computed } from 'vue';
import type { ConsentStatus, ConsentParams } from 'src/types/gtag';

export interface ConsentState {
  ad_storage: ConsentStatus;
  ad_user_data: ConsentStatus;
  ad_personalization: ConsentStatus;
  analytics_storage: ConsentStatus;
}

const CONSENT_STORAGE_KEY = 'golazo_kings_cookie_consent';
const CONSENT_VERSION = 1;

// Cargar consentimiento guardado inmediatamente
const loadConsentFromStorage = (): ConsentState | null => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // Verificar versión del consentimiento
        if (data.version === CONSENT_VERSION) {
          return data.consent;
        }
      }
    } catch (error) {
      console.error('Error loading consent from storage:', error);
    }
  }
  return null;
};

// Inicializar estado con valor guardado (si existe)
const savedConsent = loadConsentFromStorage();

// Estado reactivo global del consentimiento
const consentGiven = ref<boolean>(savedConsent !== null);
const consentDecision = ref<ConsentState | null>(savedConsent);

/**
 * Composable para gestionar Google Consent Mode v2
 * Implementa GDPR/ePrivacy compliance para AdSense
 */
export function useGoogleConsent() {
  /**
   * Inicializa Google Consent Mode con valores por defecto (denied)
   * Debe llamarse antes de cargar cualquier script de Google
   */
  const initializeConsentMode = () => {
    // Verificar si ya existe consentimiento guardado
    const savedConsent = loadConsentFromStorage();
    
    if (savedConsent) {
      consentGiven.value = true;
      consentDecision.value = savedConsent;
      updateGoogleConsent(savedConsent);
    } else {
      // Valores por defecto: denied (GDPR compliant)
      setDefaultConsent();
    }
  };

  /**
   * Establece valores por defecto de consentimiento (denied)
   */
  const setDefaultConsent = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      const params: ConsentParams = {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        wait_for_update: 500, // Esperar 500ms para el banner
      };
      window.gtag('consent', 'default', params);
    }
  };

  /**
   * Acepta todas las cookies
   */
  const acceptAllConsent = () => {
    const consent: ConsentState = {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    };

    updateGoogleConsent(consent);
    saveConsentToStorage(consent);
    consentGiven.value = true;
    consentDecision.value = consent;
  };

  /**
   * Rechaza todas las cookies (excepto las esenciales)
   */
  const denyAllConsent = () => {
    const consent: ConsentState = {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    };

    updateGoogleConsent(consent);
    saveConsentToStorage(consent);
    consentGiven.value = true;
    consentDecision.value = consent;
  };

  /**
   * Acepta solo cookies necesarias (ads básicos sin personalización)
   */
  const acceptNecessaryOnly = () => {
    const consent: ConsentState = {
      ad_storage: 'granted', // Permite ads no personalizados
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    };

    updateGoogleConsent(consent);
    saveConsentToStorage(consent);
    consentGiven.value = true;
    consentDecision.value = consent;
  };

  /**
   * Actualiza el consentimiento en Google
   */
  const updateGoogleConsent = (consent: ConsentState) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', consent);
    }
  };

  /**
   * Guarda el consentimiento en localStorage
   */
  const saveConsentToStorage = (consent: ConsentState) => {
    if (typeof window !== 'undefined') {
      try {
        const data = {
          consent,
          version: CONSENT_VERSION,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Error saving consent to storage:', error);
      }
    }
  };


  /**
   * Resetea el consentimiento (para testing o cambio de preferencias)
   */
  const resetConsent = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      consentGiven.value = false;
      consentDecision.value = null;
      setDefaultConsent();
    }
  };

  /**
   * Verifica si el usuario ya dio su consentimiento
   */
  const hasUserConsent = computed(() => consentGiven.value);

  /**
   * Verifica si los ads están permitidos (storage o personalization)
   */
  const areAdsAllowed = computed(() => {
    if (!consentDecision.value) return false;
    return (
      consentDecision.value.ad_storage === 'granted' ||
      consentDecision.value.ad_personalization === 'granted'
    );
  });

  /**
   * Verifica si los ads personalizados están permitidos
   */
  const arePersonalizedAdsAllowed = computed(() => {
    if (!consentDecision.value) return false;
    return consentDecision.value.ad_personalization === 'granted';
  });

  return {
    // Estado
    hasUserConsent,
    areAdsAllowed,
    arePersonalizedAdsAllowed,
    consentDecision,
    
    // Métodos
    initializeConsentMode,
    acceptAllConsent,
    denyAllConsent,
    acceptNecessaryOnly,
    resetConsent,
  };
}

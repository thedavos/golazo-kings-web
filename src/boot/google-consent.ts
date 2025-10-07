import { boot } from 'quasar/wrappers';

/**
 * Boot file para inicializar Google Consent Mode v2
 * Este debe cargarse ANTES de cualquier script de Google (AdSense, Analytics, etc.)
 */
export default boot(() => {
  // Solo ejecutar en el cliente (no en SSR)
  if (typeof window === 'undefined') return;

  // Inicializar dataLayer si no existe
  window.dataLayer = window.dataLayer || [];

  // Definir función gtag
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  // Registrar timestamp
  window.gtag('js', new Date());

  // Establecer valores por defecto de consentimiento (GDPR compliant)
  // Todos en 'denied' hasta que el usuario dé su consentimiento
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500, // Esperar 500ms para que aparezca el banner
  });

  console.log('[Google Consent Mode] Initialized with default denied state');
});

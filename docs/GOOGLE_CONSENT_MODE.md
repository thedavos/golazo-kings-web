# 🍪 Google Consent Mode v2 - Documentación

Esta documentación explica cómo funciona la implementación de **Google Consent Mode v2** en Golazo Kings para cumplir con GDPR y regulaciones de privacidad.

## 📋 Tabla de Contenidos

- [¿Qué es Google Consent Mode?](#qué-es-google-consent-mode)
- [¿Por qué es necesario?](#por-qué-es-necesario)
- [Arquitectura de la Implementación](#arquitectura-de-la-implementación)
- [Flujo de Consentimiento](#flujo-de-consentimiento)
- [Integración en tu App](#integración-en-tu-app)
- [Testing](#testing)
- [FAQ](#faq)

---

## 🎯 ¿Qué es Google Consent Mode?

Google Consent Mode v2 es un framework que permite a los sitios web comunicar el estado del consentimiento del usuario a los servicios de Google (AdSense, Analytics, etc.).

**Características:**
- ✅ Compatible con GDPR (Unión Europea)
- ✅ Compatible con ePrivacy Directive
- ✅ Requerido por Google para AdSense desde marzo 2024
- ✅ Permite ads no personalizados sin consentimiento completo

---

## ⚠️ ¿Por qué es necesario?

### Obligaciones Legales

1. **GDPR (UE)**: Requiere consentimiento explícito para cookies no esenciales
2. **ePrivacy Directive**: Requiere información y consentimiento para cookies
3. **Google AdSense**: Requiere Consent Mode v2 desde marzo 2024

### Consecuencias de no implementarlo

- ❌ **Multas GDPR**: Hasta €20M o 4% de facturación anual
- ❌ **Suspensión de AdSense**: Google puede suspender tu cuenta
- ❌ **Pérdida de ingresos**: Sin ads, sin ingresos
- ❌ **Problemas legales**: Demandas de usuarios

---

## 🏗️ Arquitectura de la Implementación

### Componentes Creados

```
src/
├── types/
│   └── gtag.d.ts                    # Type definitions para gtag
├── boot/
│   └── google-consent.ts            # Inicialización de Consent Mode
└── modules/ads/
    ├── components/
    │   ├── CookieConsent.vue        # Banner de consentimiento
    │   ├── AdBanner.vue             # Banner de ads (respeta consent)
    │   └── AdInFeed.vue             # Ads en lista (respeta consent)
    └── composables/
        ├── useGoogleConsent.ts      # Lógica de consentimiento
        └── useAds.ts                # Config de ads + consent
```

### Flujo de Datos

```
1. Boot File (google-consent.ts)
   ↓
2. Inicializa gtag con consent='denied' por defecto
   ↓
3. Usuario ve CookieConsent banner
   ↓
4. Usuario elige: Aceptar / Rechazar / Solo necesarias
   ↓
5. useGoogleConsent actualiza el estado
   ↓
6. useAds verifica consentimiento
   ↓
7. Componentes de ads se renderizan (o no)
```

---

## 🔄 Flujo de Consentimiento

### Estado Inicial (sin consentimiento)

```javascript
// Valores por defecto (GDPR compliant)
{
  ad_storage: 'denied',           // No guardar cookies de ads
  ad_user_data: 'denied',         // No usar datos del usuario
  ad_personalization: 'denied',   // No personalizar ads
  analytics_storage: 'denied'     // No guardar datos analíticos
}
```

### Opción 1: Aceptar Todas

```javascript
// Usuario acepta todo
{
  ad_storage: 'granted',           // ✅ Cookies de ads
  ad_user_data: 'granted',         // ✅ Datos del usuario
  ad_personalization: 'granted',   // ✅ Ads personalizados
  analytics_storage: 'granted'     // ✅ Analytics
}
```

**Resultado:** Ads personalizados + Mayor revenue

### Opción 2: Solo Necesarias

```javascript
// Usuario acepta ads básicos sin personalización
{
  ad_storage: 'granted',           // ✅ Cookies de ads (básicas)
  ad_user_data: 'denied',          // ❌ No datos del usuario
  ad_personalization: 'denied',    // ❌ No personalización
  analytics_storage: 'denied'      // ❌ No analytics
}
```

**Resultado:** Ads no personalizados + Revenue reducido (~50%)

### Opción 3: Rechazar Todo

```javascript
// Usuario rechaza todo
{
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied'
}
```

**Resultado:** Sin ads + Sin revenue

---

## 🚀 Integración en tu App

### 1. Banner de Consentimiento

El banner se muestra automáticamente si el usuario no ha dado su consentimiento.

**Agregar al MainLayout:**

```vue
<!-- src/layouts/MainLayout.vue -->
<template>
  <q-layout>
    <!-- Tu contenido -->
    
    <!-- Banner de consentimiento -->
    <cookie-consent />
  </q-layout>
</template>

<script setup lang="ts">
import { CookieConsent } from 'src/modules/ads/components';
</script>
```

### 2. Verificar el Estado

Puedes verificar el estado del consentimiento en cualquier componente:

```vue
<script setup lang="ts">
import { useGoogleConsent } from 'src/modules/ads/composables/useGoogleConsent';

const { 
  hasUserConsent,           // ¿Usuario ya decidió?
  areAdsAllowed,            // ¿Ads permitidos?
  arePersonalizedAdsAllowed // ¿Ads personalizados?
} = useGoogleConsent();
</script>

<template>
  <div>
    <p v-if="!hasUserConsent">Por favor acepta las cookies</p>
    <p v-if="arePersonalizedAdsAllowed">Ads personalizados activos</p>
  </div>
</template>
```

### 3. Inicialización Automática

El consentimiento se inicializa automáticamente en el boot file:

```typescript
// src/boot/google-consent.ts (ya configurado)
// No necesitas hacer nada, se ejecuta automáticamente
```

---

## 🧪 Testing

### Modo Desarrollo (sin ads)

```bash
# .env.local
VITE_ADSENSE_ENABLED=false
```

El banner NO aparecerá, y los ads NO se mostrarán.

### Modo Testing (con banner, sin ads reales)

```bash
# .env.local
VITE_ADSENSE_ENABLED=true
VITE_ADSENSE_CLIENT_ID=ca-pub-0000000000000000
VITE_ADSENSE_SLOT_BANNER=1234567890
VITE_ADSENSE_SLOT_INFEED=0987654321
```

El banner aparecerá, pero los ads usarán IDs de prueba.

### Modo Producción

```bash
# .env.local
VITE_ADSENSE_ENABLED=true
VITE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
VITE_ADSENSE_SLOT_BANNER=XXXXXXXXXX
VITE_ADSENSE_SLOT_INFEED=XXXXXXXXXX
```

### Resetear Consentimiento (para testing)

```javascript
// En la consola del navegador
localStorage.removeItem('golazo_kings_cookie_consent');
location.reload();
```

O usa el composable:

```vue
<script setup>
import { useGoogleConsent } from 'src/modules/ads/composables/useGoogleConsent';

const { resetConsent } = useGoogleConsent();

// Llamar cuando necesites resetear
resetConsent();
</script>
```

---

## 🔍 Verificación de Implementación

### 1. Verificar gtag en la consola

```javascript
// Abrir DevTools → Console
console.log(window.gtag);  // Debe existir
console.log(window.dataLayer);  // Debe ser un array
```

### 2. Verificar estado de consentimiento

```javascript
// En la consola
const consent = localStorage.getItem('golazo_kings_cookie_consent');
console.log(JSON.parse(consent));
```

### 3. Verificar con Google Tag Assistant

1. Instalar [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. Abrir tu sitio
3. Click en la extensión
4. Verificar que aparece "Consent Mode" con estado correcto

---

## ❓ FAQ

### ¿Cuánto tiempo se guarda el consentimiento?

El consentimiento se guarda en `localStorage` indefinidamente hasta que:
- El usuario lo revoque manualmente
- Se limpie el almacenamiento del navegador
- Se cambie la versión del consentimiento en el código

### ¿Qué pasa si el usuario usa AdBlock?

El AdBlock bloqueará los scripts de AdSense, pero el banner de consentimiento seguirá funcionando (es nuestro código, no de Google).

### ¿Afecta al revenue?

Sí, pero es menor de lo que piensas:
- **Aceptar todo**: 100% revenue
- **Solo necesarias**: ~50-70% revenue (ads no personalizados)
- **Rechazar**: 0% revenue

**Típicamente:** 60-80% de usuarios aceptan todas las cookies.

### ¿Necesito una política de privacidad?

**Sí, es obligatorio.** Debes tener:
- Página de Política de Privacidad
- Explicar qué cookies usas
- Explicar cómo se usan los datos
- Dar opción de contacto

### ¿Funciona con Google Analytics?

¡Sí! Si en el futuro agregas Google Analytics, el mismo sistema de consentimiento funciona. Solo necesitas:

1. Agregar GA4 script
2. Configurar con el mismo gtag
3. El consent mode ya controla analytics_storage

### ¿Qué pasa con usuarios fuera de la UE?

Técnicamente, GDPR solo aplica a usuarios de la UE, pero:
- Es mejor prácti buena aplicarlo a todos
- Google lo recomienda globalmente
- Builds trust con los usuarios
- Evita problemas legales futuros

### ¿Puedo personalizar el banner?

¡Sí! El componente `CookieConsent.vue` es completamente personalizable:

- Textos
- Colores
- Botones
- Animaciones
- Layout

### ¿Cómo cambio el versión del consentimiento?

Si cambias significativamente cómo usas las cookies:

```typescript
// src/modules/ads/composables/useGoogleConsent.ts
const CONSENT_VERSION = 2; // Incrementar número
```

Esto forzará a todos los usuarios a volver a dar su consentimiento.

---

## 📚 Recursos Adicionales

### Documentación Oficial

- [Google Consent Mode](https://support.google.com/analytics/answer/9976101)
- [GDPR Official Text](https://gdpr-info.eu/)
- [ePrivacy Directive](https://ec.europa.eu/digital-single-market/en/revision-eprivacy-directive)

### Herramientas

- [Google Tag Assistant](https://tagassistant.google.com/)
- [GDPR Compliance Checker](https://gdprchecker.io/)
- [Cookie Scanner](https://www.cookiemetrix.com/)

### Support

- [Google AdSense Help](https://support.google.com/adsense/)
- [GDPR FAQ](https://gdpr.eu/faq/)

---

## ✅ Checklist de Implementación

Antes de ir a producción, verifica:

- [ ] Banner de consentimiento aparece en primera visita
- [ ] Las 3 opciones funcionan (Aceptar/Rechazar/Solo necesarias)
- [ ] El consentimiento se guarda en localStorage
- [ ] Los ads NO aparecen sin consentimiento
- [ ] Los ads aparecen después de aceptar
- [ ] gtag está inicializado correctamente
- [ ] Tienes política de privacidad publicada
- [ ] El link a privacidad funciona
- [ ] Tested en mobile y desktop
- [ ] Tested en diferentes navegadores

---

¡Listo! Tu implementación de Google Consent Mode v2 está completa y es GDPR compliant. 🎉

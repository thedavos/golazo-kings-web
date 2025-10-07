# 📱 Ejemplo de Integración de AdBanner

Este documento muestra cómo integrar el componente `AdBanner` en tu layout principal.

## 🎯 Integración en MainLayout.vue

Para mostrar el banner inferior en toda la aplicación, agrégalo al `MainLayout.vue`:

### Ubicación del archivo
`src/layouts/MainLayout.vue`

### Código a agregar

```vue
<template>
  <q-layout view="lHh lpR fff" class="min-h-screen bg-surface-default text-white">
    <home-header @open-menu="drawerRight = true" />

    <q-page-container class="flex flex-col min-h-screen">
      <div class="flex-1">
        <router-view />
      </div>
      <home-footer />
    </q-page-container>

    <!-- Resto de drawers... -->
    
    <!-- 🆕 AGREGAR BANNER DE ADS AQUÍ -->
    <ad-banner :closeable="true" />
  </q-layout>
</template>

<script setup lang="ts">
// ... tus imports existentes ...
import { AdBanner } from 'src/modules/ads/components'; // 🆕 Agregar este import

// ... resto de tu código ...
</script>
```

## 📋 Pasos de integración

### 1. Importar el componente

En la sección `<script setup>` de `MainLayout.vue`, agrega:

```typescript
import { AdBanner } from 'src/modules/ads/components';
```

### 2. Agregar el componente al template

Dentro del `<q-layout>`, después de todos los drawers, agrega:

```vue
<ad-banner :closeable="true" />
```

### 3. (Opcional) Ajustar estilos si es necesario

Si el banner interfiere con otros elementos (como el footer), puedes agregar padding en el page-container:

```vue
<style scoped>
.q-page-container {
  padding-bottom: 90px; /* Espacio para el banner */
}
</style>
```

## ✅ El componente AdInFeed ya está integrado

El componente `AdInFeed` **ya está integrado** en `PlayerList.vue` y mostrará ads cada 5 jugadores automáticamente cuando:

1. Las variables de entorno estén configuradas
2. `VITE_ADSENSE_ENABLED=true`

**Ubicación:** `src/modules/players/components/PlayerList/PlayerList.vue`

## 🧪 Testing

### Desarrollo (sin ads reales)

```bash
# .env.local
VITE_ADSENSE_ENABLED=false
```

Los componentes no se renderizarán.

### Testing con IDs de prueba

```bash
# .env.local
VITE_ADSENSE_ENABLED=true
VITE_ADSENSE_CLIENT_ID=ca-pub-0000000000000000
VITE_ADSENSE_SLOT_BANNER=1234567890
VITE_ADSENSE_SLOT_INFEED=0987654321
```

Verás placeholders de AdSense en modo de prueba.

### Producción

```bash
# .env.local
VITE_ADSENSE_ENABLED=true
VITE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX  # Tu ID real
VITE_ADSENSE_SLOT_BANNER=XXXXXXXXXX              # Tu slot ID real
VITE_ADSENSE_SLOT_INFEED=XXXXXXXXXX              # Tu slot ID real
```

## 🎨 Personalización del AdBanner

### Sin botón de cierre

```vue
<ad-banner :closeable="false" />
```

### Mostrar solo en ciertas páginas

```vue
<template>
  <q-layout>
    <!-- ... -->
    
    <!-- Solo mostrar en la página de inicio -->
    <ad-banner v-if="$route.name === 'home'" :closeable="true" />
  </q-layout>
</template>
```

### Ocultar en páginas específicas

```vue
<template>
  <q-layout>
    <!-- ... -->
    
    <!-- No mostrar en página de configuración -->
    <ad-banner v-if="$route.name !== 'settings'" :closeable="true" />
  </q-layout>
</template>
```

## 📱 Responsive

Los componentes son totalmente responsive:

- **Mobile**: Banner 320x50
- **Tablet**: Banner 468x60 o 728x90
- **Desktop**: Banner 728x90 o 970x90

AdSense ajusta automáticamente el tamaño según el espacio disponible.

## ⚠️ Notas importantes

1. **No modifiques** el código del componente `Adsense.vue` - va contra las políticas de AdSense
2. **No hagas clic** en tus propios ads durante las pruebas
3. Los ads pueden tardar **24-48h** en aparecer después de configurarlos
4. En desarrollo local, es normal ver errores de AdSense en la consola

## 🔗 Recursos

- [Documentación completa de AdSense](./ADSENSE_SETUP.md)
- [Políticas de AdSense](https://support.google.com/adsense/answer/48182)
- [Dashboard de AdSense](https://www.google.com/adsense/)

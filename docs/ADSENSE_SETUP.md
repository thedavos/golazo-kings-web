# 📢 Módulo de Publicidad (Google AdSense)

Este módulo gestiona la implementación de Google AdSense en la aplicación Golazo Kings.

## 🎯 Estructura

```
src/modules/ads/
├── components/
│   ├── Adsense.vue       # Componente base de AdSense
│   ├── AdBanner.vue      # Banner fijo inferior
│   ├── AdInFeed.vue      # Ads en lista de jugadores
│   └── index.ts          # Exportaciones
├── composables/
│   └── useAds.ts         # Composable de configuración
```

## 🚀 Configuración

### 1. Crear cuenta de Google AdSense

1. Ve a [Google AdSense](https://www.google.com/adsense/)
2. Regístrate con tu cuenta de Google
3. Añade tu sitio web
4. Espera la aprobación (puede tomar 1-2 semanas)

### 2. Crear unidades de anuncio

Una vez aprobado, crea dos unidades de anuncio:

#### Banner Inferior (Display Ad)
- Tipo: **Display Ad**
- Tamaño: **Responsive** o **320x50** (mobile) / **728x90** (desktop)
- Nombre sugerido: "Banner Inferior Golazo Kings"

#### In-Feed Ad (Lista de jugadores)
- Tipo: **In-feed ad**
- Nombre sugerido: "Lista Jugadores Golazo Kings"
- Layout: Personaliza para que coincida con el diseño de tus cards

### 3. Configurar variables de entorno

Copia el archivo `.env.example` a `.env.local` (si aún no existe) y configura:

```bash
# ADSENSE
VITE_ADSENSE_ENABLED=true
VITE_ADSENSE_CLIENT_ID=ca-pub-1234567890123456
VITE_ADSENSE_SLOT_BANNER=1234567890
VITE_ADSENSE_SLOT_INFEED=0987654321
```

**Dónde encontrar estos valores:**
- `VITE_ADSENSE_CLIENT_ID`: En tu cuenta de AdSense → Configuración → ID del editor
- `VITE_ADSENSE_SLOT_BANNER`: En la unidad de anuncio del banner → ID de la unidad de anuncio
- `VITE_ADSENSE_SLOT_INFEED`: En la unidad de anuncio in-feed → ID de la unidad de anuncio

## 📦 Uso de Componentes

### AdBanner - Banner Inferior

Componente para mostrar un banner fijo en la parte inferior de la pantalla.

**Características:**
- ✅ Fijo en la parte inferior
- ✅ Botón de cierre (opcional)
- ✅ Animación de entrada/salida
- ✅ Responsive

**Uso:**
```vue
<template>
  <div>
    <!-- Tu contenido -->
    <ad-banner :closeable="true" />
  </div>
</template>

<script setup>
import { AdBanner } from 'src/modules/ads/components';
</script>
```

**Props:**
- `closeable` (boolean, opcional): Permite cerrar el banner. Default: `true`

### AdInFeed - Ads en Lista

Componente para mostrar ads dentro de listas con scroll.

**Características:**
- ✅ Lazy loading (solo carga cuando es visible)
- ✅ Placeholder mientras carga
- ✅ IntersectionObserver para optimización
- ✅ Diseño integrado con la lista

**Uso en PlayerList:**
```vue
<template>
  <div>
    <template v-for="(player, index) in players">
      <player-card :player="player" />
      
      <!-- Ad cada 5 jugadores -->
      <ad-in-feed v-if="(index + 1) % 5 === 0" />
    </template>
  </div>
</template>

<script setup>
import { AdInFeed } from 'src/modules/ads/components';
</script>
```

**Ya implementado en:**
- `src/modules/players/components/PlayerList/PlayerList.vue`

## 🎨 Personalización

### Cambiar frecuencia de ads en la lista

En `PlayerList.vue`, puedes ajustar la prop `adInterval`:

```vue
<player-list 
  :players="players" 
  :ad-interval="7"  <!-- Ad cada 7 jugadores -->
/>
```

### Estilos personalizados

Los componentes usan CSS variables de Quasar. Puedes personalizarlos en tu tema:

```css
:root {
  --q-background-tertiary: #f9fafb;
  --q-border-muted: #e5e7eb;
  --q-text-muted: #6b7280;
}
```

## 🧪 Testing y Desarrollo

### Modo de prueba

Para probar sin usar IDs reales:

```bash
# .env.local
VITE_ADSENSE_ENABLED=false
```

Los componentes no se mostrarán si `VITE_ADSENSE_ENABLED` es `false`.

### Test con IDs de prueba

Google AdSense proporciona IDs de prueba para desarrollo:

```bash
VITE_ADSENSE_ENABLED=true
VITE_ADSENSE_CLIENT_ID=ca-pub-0000000000000000
VITE_ADSENSE_SLOT_BANNER=1234567890
VITE_ADSENSE_SLOT_INFEED=0987654321
```

⚠️ **IMPORTANTE:** Los IDs de prueba no generarán revenue real.

## ⚠️ Consideraciones Importantes

### Políticas de AdSense

- ❌ No hagas clic en tus propios anuncios
- ❌ No pidas a otros que hagan clic
- ❌ No uses palabras como "Haz clic aquí" cerca de los ads
- ❌ No modifiques el código de los ads
- ✅ Lee las [Políticas del Programa de AdSense](https://support.google.com/adsense/answer/48182)

### GDPR y Consentimiento

Si tienes usuarios de la UE, necesitas implementar un banner de consentimiento de cookies:

```bash
npm install vue-cookiebot
# O usar otra solución de consent management
```

### Performance

- Los ads pueden aumentar el tiempo de carga inicial (~100-200ms)
- El lazy loading en `AdInFeed` minimiza el impacto
- Considera usar `loading="lazy"` en imágenes de tu app

### AdBlockers

- ~30% de usuarios usan adblockers
- Los ads no se mostrarán para estos usuarios
- Considera estrategias alternativas de monetización

## 🔍 Debugging

### Los ads no aparecen

1. Verifica que `VITE_ADSENSE_ENABLED=true`
2. Verifica que los IDs estén correctos
3. Abre la consola del navegador y busca errores
4. Verifica que tu sitio esté aprobado en AdSense
5. Los ads pueden tardar 24-48h en aparecer después de crear las unidades

### Console errors

Si ves errores de AdSense en la consola:
- `adsbygoogle.push() error`: Normal durante desarrollo
- `No slot size for availableWidth`: Los ads están cargando, es normal
- `Ad unit not found`: Verifica los IDs de las unidades

## 📊 Monitoreo

Monitorea el rendimiento de tus ads en:
1. [Google AdSense Dashboard](https://www.google.com/adsense/)
2. Métricas clave:
   - **CTR** (Click-Through Rate): ~1-3% es normal
   - **RPM** (Revenue per 1000 impressions): Varía por nicho
   - **Fill Rate**: Debe estar cerca del 100%

## 🤝 Soporte

Para problemas con AdSense:
- [Centro de ayuda de AdSense](https://support.google.com/adsense/)
- [Foro de la comunidad](https://support.google.com/adsense/community)

Para problemas con este módulo:
- Abre un issue en el repositorio del proyecto

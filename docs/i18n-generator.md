# 🌍 Generador de Traducciones con IA

Script automatizado para generar traducciones en múltiples idiomas usando OpenAI GPT-4.

## 📋 Requisitos

- Node.js 18+
- API Key de OpenAI

## 🚀 Configuración

### 1. Obtener API Key de OpenAI

1. Ve a [OpenAI Platform](https://platform.openai.com/api-keys)
2. Inicia sesión o crea una cuenta
3. Genera una nueva API key
4. Copia la key (empieza con `sk-proj-...`)

### 2. Configurar la API Key

Puedes configurarla de dos formas:

**Opción A: Variable de entorno temporal**
```bash
export OPENAI_API_KEY=sk-proj-tu-api-key-aqui
```

**Opción B: Archivo .env (recomendado)**
```bash
# Crea un archivo .env en la raíz del proyecto
echo "OPENAI_API_KEY=sk-proj-tu-api-key-aqui" > .env
```

## 📝 Estructura de Archivos

```
src/i18n/
├── es-ES.json          # Archivo fuente (español)
├── en-US.json          # Generado automáticamente
├── pt-BR.json          # Generado automáticamente
├── fr-FR.json          # Generado automáticamente
├── de-DE.json          # Generado automáticamente
├── it-IT.json          # Generado automáticamente
└── index.ts            # Auto-generado, exporta todos los idiomas
```

## 🎯 Uso

### Generar todas las traducciones

```bash
npm run i18n:generate
```

Este comando:
1. Lee el archivo `src/i18n/es-ES.json`
2. Traduce a todos los idiomas configurados
3. Guarda los archivos JSON en `src/i18n/`
4. Actualiza el archivo `index.ts` automáticamente

### Generar solo idiomas específicos

```bash
# Solo inglés y portugués
npm run i18n:generate -- --languages=en-US,pt-BR

# Solo francés
npm run i18n:generate -- --languages=fr-FR
```

## 📖 Formato del Archivo Fuente

El archivo `src/i18n/es-ES.json` debe ser un objeto JSON válido con la estructura que prefieras:

### Ejemplo simple:

```json
{
  "welcome": "Bienvenido",
  "goodbye": "Adiós",
  "hello": "Hola {name}"
}
```

### Ejemplo anidado (recomendado):

```json
{
  "common": {
    "welcome": "Bienvenido",
    "save": "Guardar",
    "cancel": "Cancelar"
  },
  "errors": {
    "notFound": "No encontrado",
    "serverError": "Error del servidor"
  },
  "player": {
    "name": "Nombre del jugador",
    "position": "Posición",
    "stats": "Estadísticas"
  }
}
```

## 🔧 Características

### ✅ Soporta:
- Objetos JSON anidados
- Placeholders: `{name}`, `{count}`, `{0}`, `{1}`
- Tags HTML: `<strong>`, `<br>`, `<span>`
- Caracteres especiales
- Emojis 🎉

### Ejemplo con placeholders:

```json
{
  "greeting": "Hola {name}, tienes {count} mensajes nuevos",
  "profile": "Ver perfil de <strong>{username}</strong>"
}
```

## 🌐 Idiomas Soportados

Por defecto, el script genera traducciones para:

- 🇺🇸 `en-US` - English (United States)
- 🇬🇧 `en-GB` - English (United Kingdom)
- 🇧🇷 `pt-BR` - Portuguese (Brazil)
- 🇫🇷 `fr-FR` - French (France)
- 🇩🇪 `de-DE` - German (Germany)
- 🇮🇹 `it-IT` - Italian (Italy)

### Agregar más idiomas

Edita el archivo `scripts/generate-translations.js`:

```javascript
const config = {
  // ...
  targetLanguages: [
    { code: 'en-US', name: 'English (United States)' },
    { code: 'ja-JP', name: 'Japanese (Japan)' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    // Agrega más idiomas aquí
  ],
};
```

## 💡 Consejos

1. **Revisa las traducciones**: Aunque OpenAI es muy bueno, siempre revisa las traducciones generadas
2. **Contexto específico**: Para términos muy específicos de tu dominio, considera agregar contexto en el JSON
3. **Consistencia**: Mantén una estructura consistente en tu archivo fuente
4. **Versionado**: Guarda los archivos generados en Git para tener historial

## 🐛 Solución de Problemas

### Error: "OPENAI_API_KEY no está configurada"

Asegúrate de haber configurado la variable de entorno:
```bash
export OPENAI_API_KEY=tu-api-key
```

### Error: "No se encontró el archivo fuente"

La primera vez que ejecutas el script, se creará automáticamente un archivo de ejemplo en `src/i18n/es-ES.json`. Edítalo con tus traducciones y vuelve a ejecutar el script.

### Error de API (429 - Rate Limit)

Has excedido el límite de llamadas de OpenAI. Espera unos minutos o:
- Divide tus traducciones en archivos más pequeños
- Usa el parámetro `--languages` para traducir de uno en uno

### La estructura del JSON no se mantiene

Verifica que tu JSON fuente sea válido:
```bash
cat src/i18n/es-ES.json | jq .
```

## 📊 Costos Estimados

Usando GPT-4o-mini (modelo actual):
- ~$0.01 por cada 1000 claves de traducción
- Ejemplo: 500 claves a 5 idiomas = ~$0.025 USD

## 🔒 Seguridad

- ⚠️ **NUNCA** hagas commit de tu archivo `.env` con la API key
- Agrega `.env` a tu `.gitignore`
- Considera usar variables de entorno en tu CI/CD

## 📚 Más Información

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Vue i18n Documentation](https://vue-i18n.intlify.dev/)
- [Quasar i18n Guide](https://quasar.dev/options/quasar-language-packs)

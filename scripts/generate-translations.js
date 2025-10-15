#!/usr/bin/env node

/**
 * Script para generar traducciones automáticas usando OpenAI
 * 
 * Uso:
 *   npm run i18n:generate
 *   npm run i18n:generate -- --languages=en-US,pt-BR
 * 
 * Variables de entorno:
 *   OPENAI_API_KEY - API key de OpenAI (requerida)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const config = {
  sourceLanguage: 'es-ES',
  sourceFile: path.join(__dirname, '../src/i18n/es-ES.json'),
  targetDir: path.join(__dirname, '../src/i18n'),
  // Idiomas objetivo por defecto
  targetLanguages: [
    { code: 'en-US', name: 'English (United States)' },
    { code: 'en-GB', name: 'English (United Kingdom)' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    { code: 'fr-FR', name: 'French (France)' },
    { code: 'de-DE', name: 'German (Germany)' },
    { code: 'it-IT', name: 'Italian (Italy)' },
  ],
};

// Parsear argumentos de línea de comandos
const args = process.argv.slice(2).reduce((acc, arg) => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.slice(2).split('=');
    acc[key] = value;
  }
  return acc;
}, {});

// Filtrar idiomas si se especifican
if (args.languages) {
  const requestedLangs = args.languages.split(',');
  config.targetLanguages = config.targetLanguages.filter(lang => 
    requestedLangs.includes(lang.code)
  );
}

/**
 * Cuenta el número de claves en un objeto anidado
 */
function countKeys(obj, count = 0) {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      count = countKeys(obj[key], count);
    } else {
      count++;
    }
  }
  return count;
}

/**
 * Traduce usando OpenAI
 */
async function translateWithOpenAI(texts, targetLanguage) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('❌ OPENAI_API_KEY no está configurada. Establécela con: export OPENAI_API_KEY=tu-api-key');
  }

  const prompt = `You are a professional translator specializing in web application localization.

Translate the following JSON object from Spanish (es-ES) to ${targetLanguage.name} (${targetLanguage.code}).

IMPORTANT INSTRUCTIONS:
- Keep the exact same JSON structure (nested objects and keys)
- Only translate the string VALUES, never translate the KEYS
- Maintain any placeholders like {name}, {count}, {0}, {1}, etc.
- Preserve HTML tags if present (e.g., <strong>, <br>)
- Keep special characters and formatting
- Use natural, native-sounding translations appropriate for a web application
- Respond ONLY with valid JSON, no explanations or markdown

Source JSON (Spanish):
${JSON.stringify(texts, null, 2)}`;

  console.log('   📡 Llamando a OpenAI API...');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator. You always respond with valid JSON only, no markdown or explanations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const translatedText = data.choices[0].message.content;
  
  // Parsear el JSON
  let translated;
  try {
    translated = JSON.parse(translatedText);
  } catch (parseError) {
    // Si falla, intentar extraer JSON de markdown
    const jsonMatch = translatedText.match(/```json\n?([\s\S]*?)\n?```/) || 
                      translatedText.match(/```\n?([\s\S]*?)\n?```/);
    const jsonString = jsonMatch ? jsonMatch[1] : translatedText;
    translated = JSON.parse(jsonString);
  }
  
  return translated;
}

/**
 * Verifica que el archivo fuente existe
 */
async function checkSourceFile() {
  try {
    await fs.access(config.sourceFile);
    return true;
  } catch {
    return false;
  }
}

/**
 * Crea un archivo de ejemplo si no existe
 */
async function createExampleSourceFile() {
  const exampleContent = {
    common: {
      welcome: 'Bienvenido',
      hello: 'Hola {name}',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      close: 'Cerrar',
      loading: 'Cargando...',
    },
    errors: {
      generic: 'Ha ocurrido un error',
      network: 'Error de conexión',
      notFound: 'No encontrado',
    },
    success: {
      saved: 'Guardado exitosamente',
      deleted: 'Eliminado exitosamente',
    },
  };

  await fs.mkdir(config.targetDir, { recursive: true });
  await fs.writeFile(
    config.sourceFile,
    JSON.stringify(exampleContent, null, 2),
    'utf-8'
  );
}

/**
 * Actualiza el archivo index.ts con todos los idiomas
 */
async function updateIndexFile() {
  const i18nDir = config.targetDir;
  const entries = await fs.readdir(i18nDir);
  
  const languages = entries
    .filter(file => file.endsWith('.json') && file !== 'index.ts')
    .map(file => file.replace('.json', ''))
    .sort();

  // Agregar el idioma fuente si no está
  if (!languages.includes(config.sourceLanguage)) {
    languages.unshift(config.sourceLanguage);
  }

  // Generar imports
  const imports = languages
    .map(lang => {
      const varName = lang.replace('-', '');
      return `import ${varName} from './${lang}.json';`;
    })
    .join('\n');

  // Generar exports
  const exports = languages
    .map(lang => {
      const varName = lang.replace('-', '');
      return `  '${lang}': ${varName},`;
    })
    .join('\n');

  const content = `${imports}\n\nexport default {\n${exports}\n};\n`;

  await fs.writeFile(path.join(i18nDir, 'index.ts'), content, 'utf-8');
}

/**
 * Proceso principal
 */
async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  🌍 Generador de Traducciones con OpenAI  ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // Verificar que existe el archivo fuente
  const sourceExists = await checkSourceFile();
  
  if (!sourceExists) {
    console.log('⚠️  No se encontró el archivo fuente en español\n');
    console.log(`📝 Creando archivo de ejemplo en: ${config.sourceFile}\n`);
    await createExampleSourceFile();
    console.log('✅ Archivo de ejemplo creado');
    console.log('💡 Por favor, edita este archivo con tus traducciones en español');
    console.log('   y luego ejecuta el script nuevamente.\n');
    return;
  }

  console.log(`📁 Archivo origen: ${config.sourceFile}`);
  console.log(`🗂️  Directorio destino: ${config.targetDir}`);
  console.log(`🎯 Idiomas a generar: ${config.targetLanguages.map(l => l.code).join(', ')}\n`);

  // Leer archivo fuente
  let sourceTranslations;
  try {
    const sourceContent = await fs.readFile(config.sourceFile, 'utf-8');
    sourceTranslations = JSON.parse(sourceContent);
    const keyCount = countKeys(sourceTranslations);
    console.log(`✅ Traducciones en español cargadas`);
    console.log(`   📊 Total de claves: ${keyCount}\n`);
  } catch (error) {
    console.error(`❌ Error leyendo archivo fuente: ${error.message}`);
    process.exit(1);
  }

  // Verificar API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY no está configurada\n');
    console.log('💡 Configúrala con:');
    console.log('   export OPENAI_API_KEY=tu-api-key\n');
    process.exit(1);
  }

  // Crear directorio si no existe
  await fs.mkdir(config.targetDir, { recursive: true });

  // Traducir a cada idioma objetivo
  let successCount = 0;
  let failCount = 0;

  for (const targetLang of config.targetLanguages) {
    console.log(`${'─'.repeat(50)}`);
    console.log(`🔄 Traduciendo a ${targetLang.name} (${targetLang.code})...`);

    try {
      // Traducir
      const translated = await translateWithOpenAI(sourceTranslations, targetLang);
      
      // Guardar archivo JSON
      const targetFile = path.join(config.targetDir, `${targetLang.code}.json`);
      await fs.writeFile(
        targetFile,
        JSON.stringify(translated, null, 2) + '\n',
        'utf-8'
      );

      console.log(`   ✅ Guardado en: ${targetFile}`);
      successCount++;
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      failCount++;
    }
    console.log('');
  }

  console.log(`${'═'.repeat(50)}\n`);

  // Actualizar archivo índice
  if (successCount > 0) {
    console.log('📝 Actualizando archivo index.ts...');
    try {
      await updateIndexFile();
      console.log('   ✅ Archivo index.ts actualizado\n');
    } catch (error) {
      console.error(`   ❌ Error actualizando índice: ${error.message}\n`);
    }
  }

  // Resumen
  console.log('╔════════════════════════════════════════════╗');
  console.log('║              📊 RESUMEN                    ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`✅ Exitosas: ${successCount}`);
  console.log(`❌ Fallidas:  ${failCount}`);
  console.log('');

  if (successCount > 0) {
    console.log('🎉 ¡Traducciones generadas exitosamente!');
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Revisa los archivos generados en src/i18n/');
    console.log('   2. Ajusta las traducciones si es necesario');
    console.log('   3. Importa las traducciones en tu aplicación\n');
  }
}

// Ejecutar
main().catch(error => {
  console.error('\n❌ Error fatal:', error.message);
  console.error(error.stack);
  process.exit(1);
});

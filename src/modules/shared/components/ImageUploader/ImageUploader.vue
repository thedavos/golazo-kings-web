<template>
  <div class="space-y-3">
    <div v-if="title" class="text-sm font-semibold text-gray-700 text-center">
      {{ title }}
    </div>

    <!-- Input file (siempre presente, oculto) -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />

    <!-- Modo: CON foto (Editar) -->
    <div v-if="hasImage" class="relative">
      <div
        class="relative w-48 h-48 mx-auto rounded-lg border-2 border-gray-300 overflow-hidden group cursor-pointer transition-all hover:border-primary"
        @click="openFileSelector"
      >
        <!-- Imagen actual -->
        <q-img :src="displayImageUrl" :fit="imageFit" class="w-full h-full">
          <template #loading>
            <div class="absolute-full flex items-center justify-center bg-gray-100">
              <q-spinner color="primary" size="md" />
            </div>
          </template>
          <template #error>
            <q-img
              v-if="fallbackImage"
              :src="fallbackImage"
              :fit="imageFit"
              class="w-full h-full"
            />
            <div v-else class="absolute-full flex items-center justify-center bg-gray-200">
              <q-icon name="la la-image" size="xl" color="grey-5" />
            </div>
          </template>
        </q-img>

        <!-- Overlay con iconos al hacer hover -->
        <div
          class="absolute inset-0 bg-black opacity-0 group-hover:opacity-70 transition-all duration-300 flex items-center justify-center gap-4 pointer-events-none"
        >
          <div class="flex gap-6">
            <!-- Icono Editar -->
            <div class="flex flex-col items-center text-white">
              <q-icon name="la la-edit" size="md" />
              <span class="text-xs mt-1">Cambiar</span>
            </div>
            <!-- Icono Eliminar -->
            <div
              v-if="allowRemove"
              class="flex flex-col items-center text-white cursor-pointer pointer-events-auto"
              @click.stop="removeImage"
            >
              <q-icon name="la la-trash" size="md" />
              <span class="text-xs mt-1">Eliminar</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modo: SIN foto (Añadir) -->
    <div v-else class="space-y-2">
      <!-- Área de upload -->
      <div
        class="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-all hover:border-primary hover:bg-gray-50"
        @click="openFileSelector"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        :class="{ 'border-primary bg-blue-50': isDragging }"
      >
        <div class="flex flex-col items-center gap-3">
          <q-icon name="la la-cloud-upload-alt" size="xl" color="grey-6" />
          <div>
            <p class="text-base text-gray-700 font-medium">
              {{ uploadText }}
            </p>
            <p class="text-xs text-gray-500 mt-1">{{ hintText }}</p>
          </div>
        </div>
      </div>

      <!-- Opción URL (secundaria) -->
      <div v-if="allowUrlInput" class="text-center">
        <button
          type="button"
          class="text-sm text-primary hover:underline"
          @click="showUrlInput = true"
        >
          o pegar una URL
        </button>
      </div>

      <!-- Input URL (toggle) -->
      <q-slide-transition>
        <div v-if="showUrlInput" class="pt-2">
          <q-input
            v-model="urlInputValue"
            dense
            outlined
            name="urlInput"
            placeholder="https://ejemplo.com/imagen.jpg"
            hint="Pega la URL de la imagen"
            :rules="[(val) => !val || isValidUrl(val) || 'URL no válida']"
          >
            <template #prepend>
              <q-icon name="la la-link" />
            </template>
            <template #append>
              <q-btn
                flat
                dense
                round
                size="sm"
                icon="la la-check"
                color="primary"
                @click="applyUrl"
              />
              <q-btn flat dense round size="sm" icon="la la-times" @click="cancelUrlInput" />
            </template>
          </q-input>
        </div>
      </q-slide-transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { validateImageFile, fileToBase64 } from 'src/modules/shared/utils/imageUpload.util';

interface Props {
  modelValue: string | null;
  title?: string;
  uploadText?: string;
  hintText?: string;
  maxSizeMB?: number;
  allowRemove?: boolean;
  allowUrlInput?: boolean;
  fallbackImage?: string;
  imageFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  uploadText: 'Arrastra una imagen o haz clic aquí',
  hintText: 'PNG, JPG hasta 5MB',
  maxSizeMB: 5,
  allowRemove: true,
  allowUrlInput: true,
  fallbackImage: '',
  imageFit: 'contain',
});

const emit = defineEmits<{
  'update:modelValue': [value: string | null];
  uploaded: [url: string];
  removed: [];
  error: [message: string];
}>();

// Estados
const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const showUrlInput = ref(false);
const urlInputValue = ref('');

// Computed
const displayImageUrl = computed(() => props.modelValue || '');
const hasImage = computed(() => !!props.modelValue);

// Validación de URL
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Procesar archivo
const processFile = async (file: File) => {
  const maxSizeBytes = props.maxSizeMB * 1024 * 1024;

  // Validar usando la utilidad
  const validation = validateImageFile(file, { maxSizeBytes });
  if (!validation.valid) {
    emit('error', validation.error!);
    return;
  }

  // Convertir a Base64
  try {
    const base64 = await fileToBase64(file);
    emit('update:modelValue', base64);
    emit('uploaded', base64);
  } catch {
    emit('error', 'Error al procesar la imagen');
  }
};

// Abrir selector de archivos
const openFileSelector = () => {
  fileInputRef.value?.click();
};

// Manejar cambio de archivo desde input
const handleFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    void processFile(file);
  }
};

// Manejar drop de archivo
const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  const file = event.dataTransfer?.files[0];
  if (file) {
    void processFile(file);
  }
};

// Quitar imagen
const removeImage = () => {
  emit('update:modelValue', null);
  emit('removed');
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

// Aplicar URL
const applyUrl = () => {
  if (urlInputValue.value && isValidUrl(urlInputValue.value)) {
    emit('update:modelValue', urlInputValue.value);
    emit('uploaded', urlInputValue.value);
    showUrlInput.value = false;
    urlInputValue.value = '';
  }
};

// Cancelar input de URL
const cancelUrlInput = () => {
  showUrlInput.value = false;
  urlInputValue.value = '';
};
</script>

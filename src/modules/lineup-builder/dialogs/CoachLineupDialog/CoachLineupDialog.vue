<template>
  <q-dialog
    ref="dialogRef"
    transition-show="jump-up"
    transition-hide="jump-down"
    @hide="onDialogHide"
  >
    <q-card class="q-dialog-plugin" style="min-width: 500px">
      <go-toolbar-header title="Seleccionar Entrenador" />

      <q-card-section class="pt-6">
        <q-tabs
          v-model="currentTab"
          dense
          no-caps
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="select" label="Seleccionar Entrenador" icon="la la-user-tie" />
          <q-tab name="upload" label="Subir Foto" icon="la la-upload" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="currentTab" class="mt-4" animated>
          <!-- Panel: Seleccionar Entrenador -->
          <q-tab-panel name="select" class="q-pa-none">
            <div class="space-y-4">
              <p class="text-sm text-gray-600">
                Todos los entrenadores de la Kings España y Américas
              </p>

              <coach-selector v-model="selectedCoachLabel" @coach-selected="onCoachSelected" />

              <!-- Preview del entrenador seleccionado -->
              <div v-if="selectedCoachOption" class="mt-6">
                <div class="text-sm font-semibold text-gray-700 mb-2">Vista previa</div>
                <div class="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg">
                  <q-avatar size="60px">
                    <img
                      :src="selectedCoachOption.photoUrl"
                      alt="coach photo"
                      class="object-contain"
                    />
                  </q-avatar>
                  <div>
                    <div class="text-lg font-bold">{{ selectedCoachOption.label }}</div>
                  </div>
                </div>
              </div>
            </div>
          </q-tab-panel>

          <!-- Panel: Subir Foto -->
          <q-tab-panel name="upload" class="q-pa-none">
            <div class="space-y-4">
              <image-uploader
                v-model="uploadedPhoto"
                title="Sube una foto personalizada para tu entrenador"
                upload-text="Arrastra la foto o haz clic aquí"
                hint-text="PNG, JPG hasta 2MB"
                image-fit="contain"
                :max-size-m-b="2"
                @uploaded="onPhotoUploaded"
                @error="onUploadError"
              />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <q-card-actions align="right" class="pb-4 pr-4">
        <q-btn color="primary" no-caps flat label="Cancelar" @click="onDialogCancel" />
        <q-btn
          color="primary"
          no-caps
          unelevated
          label="Confirmar"
          :disable="!hasSelection"
          @click="onConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { GoToolbarHeader } from 'src/modules/shared/components/GoToolbarHeader';
import { CoachSelector } from 'src/modules/lineup-builder/components/CoachSelector';
import { ImageUploader } from 'src/modules/shared/components/ImageUploader';
import type { CoachSelectOption } from 'src/modules/lineup-builder/constants/coach.constant';
import { useLineupStore } from 'stores/useLineupStore';
import { storeToRefs } from 'pinia';

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
const $q = useQuasar();
const lineupStore = useLineupStore();
const { lineupCoach } = storeToRefs(lineupStore);

// Estado
const currentTab = ref<'select' | 'upload'>('select');
const selectedCoachLabel = ref<string | null>(lineupCoach.value?.label || null);
const selectedCoachOption = ref<CoachSelectOption | null>(lineupCoach.value);
const uploadedPhoto = ref<string | null>(null);

// Computed
const hasSelection = computed(() => {
  return !!selectedCoachOption.value || !!uploadedPhoto.value;
});

// Handlers
const onCoachSelected = (coach: CoachSelectOption) => {
  selectedCoachOption.value = coach;
};

const onPhotoUploaded = (url: string) => {
  console.log('✅ Foto subida:', url);
};

const onUploadError = (message: string) => {
  $q.notify({
    type: 'negative',
    message: message,
    position: 'top',
  });
};

const onConfirm = () => {
  if (currentTab.value === 'select' && selectedCoachOption.value) {
    // Guardar el entrenador seleccionado en el store
    lineupStore.lineupCoach = selectedCoachOption.value;

    onDialogOK({
      type: 'coach',
      coach: selectedCoachOption.value,
      photoUrl: selectedCoachOption.value.photoUrl,
    });
  } else if (currentTab.value === 'upload' && uploadedPhoto.value) {
    // Crear un entrenador personalizado con la foto subida
    const customCoach: CoachSelectOption = {
      label: 'Entrenador',
      value: 'custom-coach',
      photoUrl: uploadedPhoto.value,
    };

    // Guardar en el store
    lineupStore.lineupCoach = customCoach;

    onDialogOK({
      type: 'custom',
      coach: customCoach,
      photoUrl: uploadedPhoto.value,
    });
  }
};
</script>

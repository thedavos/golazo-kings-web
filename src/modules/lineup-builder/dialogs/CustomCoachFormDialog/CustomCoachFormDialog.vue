<template>
  <q-dialog
    ref="dialogRef"
    transition-show="jump-up"
    transition-hide="jump-down"
    @hide="onDialogHide"
  >
    <q-card class="q-dialog-plugin" style="min-width: 500px">
      <go-toolbar-header :title="mode === 'create' ? 'Crear Entrenador' : 'Editar Entrenador'" />

      <q-card-section class="pt-6">
        <q-form ref="formRef" class="space-y-4">
          <!-- Foto del Entrenador -->
          <div class="space-y-3">
            <div class="text-sm font-semibold text-gray-700 text-center">Foto del Entrenador</div>

            <image-uploader
              v-model="formData.photoUrl"
              upload-text="Arrastra la foto o haz clic aquí"
              hint-text="PNG, JPG hasta 2MB"
              image-fit="contain"
              :max-size-m-b="2"
            />
          </div>

          <q-separator />

          <!-- Nombre del Entrenador -->
          <q-input
            v-model="formData.label"
            dense
            outlined
            no-error-icon
            label="Nombre Completo *"
            name="label"
            hint="Ej: 'Gerard Piqué', 'Sergio Ramos'"
            :rules="[(val) => !!val || 'El nombre es requerido']"
          >
            <template #prepend>
              <q-icon name="la la-user-tie" />
            </template>
          </q-input>

          <!-- Identificador (value) -->
          <q-input
            v-model="formData.value"
            dense
            outlined
            no-error-icon
            label="Identificador (slug) *"
            name="value"
            hint="Ej: 'gerard_pique' (minúsculas, guiones bajos)"
            :rules="[
              (val) => !!val || 'El identificador es requerido',
              (val) => /^[a-z0-9_]+$/.test(val) || 'Solo minúsculas, números y guiones bajos',
            ]"
          >
            <template #prepend>
              <q-icon name="la la-tag" />
            </template>
          </q-input>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="pb-4 pr-4">
        <q-btn color="primary" no-caps flat label="Cancelar" @click="onDialogCancel" />
        <q-btn
          color="primary"
          no-caps
          unelevated
          :label="mode === 'create' ? 'Crear Entrenador' : 'Guardar cambios'"
          :loading="isSaving"
          @click="onSaveClick"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useDialogPluginComponent, QForm } from 'quasar';
import { useCustomEntitiesStore } from 'stores/useCustomEntitiesStore';
import { useFeedback } from 'src/modules/shared/composables/useFeedback';
import { GoToolbarHeader } from 'src/modules/shared/components/GoToolbarHeader';
import { ImageUploader } from 'src/modules/shared/components/ImageUploader';
import type { CustomCoach } from 'src/modules/lineup-builder/types/custom-entities.types';

interface Props {
  coach?: CustomCoach;
  mode: 'create' | 'edit';
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
});

defineEmits([...useDialogPluginComponent.emits]);

const customEntitiesStore = useCustomEntitiesStore();
const feedback = useFeedback();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const formRef = ref<QForm | null>(null);
const isSaving = ref(false);

const formData = reactive({
  label: props.coach?.label || '',
  value: props.coach?.value || '',
  photoUrl: props.coach?.photoUrl || '',
});

async function onSaveClick() {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  isSaving.value = true;

  try {
    const coachData: CustomCoach = {
      label: formData.label,
      value: formData.value,
      photoUrl: formData.photoUrl,
    };

    if (props.mode === 'create') {
      const newCoach = customEntitiesStore.addCustomCoach(coachData);
      feedback.success({ message: 'Entrenador creado exitosamente' });
      onDialogOK(newCoach);
    } else if (props.coach) {
      customEntitiesStore.updateCustomCoach(props.coach.value, coachData);
      feedback.success({ message: 'Entrenador actualizado exitosamente' });
      onDialogOK({ ...props.coach, ...coachData });
    }
  } catch (error) {
    console.error('Error al guardar:', error);
    feedback.error({ message: 'Error al guardar el entrenador' });
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <q-dialog
    ref="dialogRef"
    transition-show="jump-up"
    transition-hide="jump-down"
    @hide="onDialogHide"
  >
    <q-card class="q-dialog-plugin" style="min-width: 500px">
      <go-toolbar-header :title="mode === 'create' ? 'Crear Equipo' : 'Editar Equipo'" />

      <q-card-section class="pt-6">
        <q-form ref="formRef" class="space-y-4">
          <!-- Logo del Equipo -->
          <div class="space-y-3">
            <div class="text-sm font-semibold text-gray-700 text-center">Logo del Equipo</div>

            <image-uploader
              v-model="formData.logo"
              image-fit="contain"
              hint-text="PNG, JPG, SVG hasta 2MB"
              :max-size-m-b="2"
            />
          </div>

          <q-separator />

          <!-- Nombre del Equipo -->
          <q-input
            v-model="formData.label"
            dense
            outlined
            no-error-icon
            label="Nombre del Equipo *"
            name="label"
            hint="Ej: 'Jijantes FC', 'Porcinos FC'"
            :rules="[(val) => !!val || 'El nombre es requerido']"
          >
            <template #prepend>
              <q-icon name="la la-shield-alt" />
            </template>
          </q-input>

          <!-- Slug (Value) -->
          <q-input
            v-model="formData.value"
            dense
            outlined
            no-error-icon
            label="Identificador (slug) *"
            name="value"
            hint="Ej: 'jijantes-fc' (minúsculas, sin espacios)"
            :rules="[
              (val) => !!val || 'El identificador es requerido',
              (val) => /^[a-z0-9-]+$/.test(val) || 'Solo minúsculas, números y guiones',
            ]"
          >
            <template #prepend>
              <q-icon name="la la-tag" />
            </template>
          </q-input>

          <!-- Descripción -->
          <q-input
            v-model="formData.description"
            dense
            outlined
            no-error-icon
            label="Ubicación / Descripción"
            name="description"
            hint="Ej: 'Barcelona, España'"
          >
            <template #prepend>
              <q-icon name="la la-map-marker-alt" />
            </template>
          </q-input>

          <!-- Tipo de Liga y ID de Liga -->
          <div class="grid grid-cols-2 gap-4">
            <q-select
              v-model="formData.type"
              dense
              outlined
              emit-value
              map-options
              no-error-icon
              label="Liga *"
              name="type"
              hint="Kings o Queens"
              option-value="value"
              option-label="label"
              dropdown-icon="la la-caret-down"
              :options="CONST.LEAGUE.LIST_OPTIONS"
              :rules="[(val) => !!val || 'La liga es requerida']"
            >
              <template #prepend>
                <q-icon name="la la-trophy" />
              </template>
            </q-select>

            <q-input
              v-model.number="formData.leagueId"
              dense
              outlined
              no-error-icon
              type="number"
              label="ID de Liga *"
              name="leagueId"
              hint="Número identificador"
              :rules="[
                (val) => (val !== null && val !== undefined) || 'El ID es requerido',
                (val) => val >= 0 || 'Debe ser mayor o igual a 0',
              ]"
            >
              <template #prepend>
                <q-icon name="la la-hashtag" />
              </template>
            </q-input>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="pb-4 pr-4">
        <q-btn color="primary" no-caps flat label="Cancelar" @click="onDialogCancel" />
        <q-btn
          color="primary"
          no-caps
          unelevated
          :label="mode === 'create' ? 'Crear Equipo' : 'Guardar cambios'"
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
import { CONST } from 'src/modules/lineup-builder/constants';
import type { CustomTeam } from 'src/modules/lineup-builder/types/custom-entities.types';

interface Props {
  team?: CustomTeam;
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

// Form data
const formData = reactive({
  label: props.team?.label || '',
  value: props.team?.value || '',
  description: props.team?.description || '',
  logo: props.team?.logo || '',
  leagueId: props.team?.leagueId ?? 0,
  color: props.team?.color || 'text-primary',
  type: (props.team?.type as 'kings' | 'queens') || 'kings',
});

// Guardar cambios
async function onSaveClick() {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  isSaving.value = true;

  try {
    const teamData: CustomTeam = {
      label: formData.label,
      value: formData.value,
      description: formData.description,
      logo: formData.logo,
      leagueId: formData.leagueId,
      teamId: 0,
      color: formData.color || '',
      type: formData.type,
      icon: '',
    };

    if (props.mode === 'create') {
      const newTeam = customEntitiesStore.addCustomTeam(teamData);
      feedback.success({ message: 'Equipo creado exitosamente' });
      onDialogOK(newTeam);
    } else if (props.team) {
      customEntitiesStore.updateCustomTeam(props.team.value, teamData);
      feedback.success({ message: 'Equipo actualizado exitosamente' });
      onDialogOK({ ...props.team, ...teamData });
    }
  } catch (error) {
    console.error('Error al guardar:', error);
    feedback.error({ message: 'Error al guardar el equipo' });
  } finally {
    isSaving.value = false;
  }
}
</script>

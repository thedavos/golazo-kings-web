<template>
  <q-dialog
    ref="dialogRef"
    transition-show="jump-up"
    transition-hide="jump-down"
    @hide="onDialogHide"
  >
    <q-card class="q-dialog-plugin w-[400px] max-w-[90vw]">
      <go-toolbar-header title="Envíanos tu feedback" />

      <q-card-section class="pt-8">
        <p class="m-0">Cuéntanos si tienes una idea o encontraste un error.</p>

        <q-option-group
          v-model="feedbackType"
          name="feedbackType"
          color="primary"
          size="sm"
          class="mt-2"
          :options="SHARED_CONST.FEEDBACK_OPTIONS"
        />
      </q-card-section>

      <q-card-section>
        <q-banner class="bg-blue-100 text-Extended-Banner">
          Se abrirá un formulario en una pestaña nueva.
        </q-banner>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn color="primary" no-caps flat label="Cancelar" @click="onDialogCancel" />
        <q-btn color="primary" no-caps unelevated label="Continuar" @click="onContinue" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { GoToolbarHeader } from 'src/modules/shared/components/GoToolbarHeader';
import { CONST as SHARED_CONST } from 'src/modules/shared/constants';
import { useDialogPluginComponent, useQuasar } from 'quasar';

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent();
const $q = useQuasar();

const feedbackType = ref('idea');

const onContinue = () => {
  if (!feedbackType.value) {
    $q.notify({
      type: 'info',
      message: 'Por favor, selecciona un tipo de feedback.',
    });
    return;
  }

  const feedbackFormUrl =
    feedbackType.value === 'idea'
      ? process.env.FEEDBACK_IDEA_FORM
      : process.env.FEEDBACK_ERROR_FORM;
  window.open(feedbackFormUrl, '_blank', 'noopener');
};
</script>

<template>
  <q-dialog
    ref="dialogRef"
    transition-show="jump-up"
    transition-hide="jump-down"
    @hide="onDialogHide"
  >
    <q-card class="q-dialog-plugin">
      <go-toolbar-header title="Guardar Alineación" />

      <q-card-section class="pt-8">
        <q-input
          v-model="lineupName"
          dense
          autofocus
          outlined
          name="lineupName"
          label="Mi equipo campeón"
          @keyup.enter="onOKClick"
        />
        <p class="m-0 mt-1 font-light text-xs text-gray-400">
          Dale un nombre para encontrarlo después en "Mis alineaciones"
        </p>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn color="primary" no-caps flat label="Cancelar" @click="onDialogCancel" />
        <q-btn color="primary" no-caps unelevated label="Guardar" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { GoToolbarHeader } from 'src/modules/shared/components/GoToolbarHeader';

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const lineupName = ref('');

function onOKClick() {
  // Puedes validar aquí
  if (!lineupName.value) {
    return;
  }
  // Al llamar a onDialogOK, pasas los datos de vuelta
  onDialogOK({
    name: lineupName.value,
  });
}
</script>

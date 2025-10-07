<template>
  <q-dialog
    ref="dialogRef"
    transition-show="jump-up"
    transition-hide="jump-down"
    @hide="onDialogHide"
  >
    <q-card class="q-dialog-plugin w-[600px] max-w-[90vw]">
      <go-toolbar-header title="Ajustes" />

      <q-card-section>
        <q-tabs
          v-model="tab"
          dense
          no-caps
          narrow-indicator
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="lineup" label="Alineación" />
          <q-tab name="database" label="Base de Datos" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="lineup">
            <div class="q-gutter-y-lg q-pt-md">
              <q-select
                v-model="formation"
                outlined
                dense
                map-options
                option-label="label"
                option-value="value"
                name="formation"
                dropdown-icon="la la-caret-down"
                label="Formación del Equipo"
                hint="Define la estructura táctica de tu equipo."
                :options="formationOptions"
              />

              <div>
                <p class="mb-1 text-sm">Presupuesto Máximo</p>
                <div class="row q-col-gutter-sm">
                  <div class="col-4">
                    <q-select
                      v-model="currency"
                      outlined
                      dense
                      map-options
                      option-label="label"
                      option-value="value"
                      name="currency"
                      dropdown-icon="la la-caret-down"
                      label="Moneda"
                      :options="CONST.CURRENCY.LIST_OPTIONS"
                    />
                  </div>
                  <div class="col-8">
                    <q-input
                      v-model.number="budget"
                      outlined
                      dense
                      name="budget"
                      type="number"
                      label="Monto"
                      :step="100"
                    />
                  </div>
                </div>
                <div class="q-field__bottom">Este es el límite de gasto para tu plantilla.</div>
              </div>

              <div class="column flex flex-col gap-2">
                <q-toggle
                  v-model="showTeamInLineup"
                  dense
                  left-label
                  name="showTeamInLineup"
                  color="primary"
                  :label="`Mostrar Equipo`"
                />
                <q-toggle
                  v-model="showCoachInLineup"
                  dense
                  left-label
                  name="showCoachInLineup"
                  color="primary"
                  :label="`Mostrar Entrenador`"
                />
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="database">
            <div class="text-body2 q-mb-md">
              Gestiona los jugadores, equipos y entrenadores disponibles en la aplicación.
            </div>
            <div class="flex flex-col gap-3">
              <q-btn
                outline
                no-caps
                dense
                color="primary"
                class="full-width"
                icon="la la-plus"
                label="Añadir nuevo Jugador"
                @click="addNew('player')"
              />
              <q-btn
                outline
                no-caps
                dense
                color="primary"
                class="full-width"
                icon="la la-plus"
                label="Añadir nuevo Equipo"
                @click="addNew('team')"
              />
              <q-btn
                outline
                no-caps
                dense
                color="primary"
                class="full-width"
                icon="la la-plus"
                label="Añadir nuevo Entrenador"
                @click="addNew('coach')"
              />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <!-- Acciones solo visibles en la pestaña "Alineación" -->
      <q-card-actions align="right" class="q-pa-md" v-if="tab === 'lineup'">
        <q-btn flat no-caps color="primary" label="Cerrar" @click="onDialogCancel" />
        <q-btn unelevated no-caps color="primary" label="Guardar Cambios" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useDialogPluginComponent } from 'quasar';
import { GoToolbarHeader } from 'src/modules/shared/components/GoToolbarHeader';
import { CONST } from 'src/modules/lineup-builder/constants';
import { useLineupStore } from 'stores/useLineupStore';
import { useFeedback } from 'src/modules/shared/composables/useFeedback';
import type { FormationOption } from 'src/modules/lineup-builder/types';

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
const feedback = useFeedback();
const lineupStore = useLineupStore();

const { currency, formation, budget, showTeamInLineup, showCoachInLineup } =
  storeToRefs(lineupStore);
const tab = ref('lineup');

const formationOptions = computed<FormationOption[]>(() => {
  return CONST.FORMATION.FORMATION_OPTIONS.map((option) => ({
    ...option,
    label: `${option.label} ${option.description ? '(' + option.description + ')' : ''}`,
    value: option.value,
  }));
});

function onOKClick() {
  // Al guardar, pasamos los ajustes de la alineación como payload
  onDialogOK({
    currency: currency.value,
    formation: formation.value,
    budget: budget.value,
  });
  feedback.info({
    message: 'Ajustes de alineación guardados',
  });
}

// --- Pestaña 2: Base de Datos ---
function addNew(type: 'player' | 'team' | 'coach') {
  // Como definiste, estas acciones abrirían otros dialogs.
  // Por ahora, solo mostramos una notificación.
  feedback.info({
    icon: 'la la-cogs',
    message: `Abriendo diálogo para añadir nuevo ${type}... (simulado)`,
  });
}
</script>

<style scoped>
.q-field__bottom {
  font-size: 11px;
}
</style>

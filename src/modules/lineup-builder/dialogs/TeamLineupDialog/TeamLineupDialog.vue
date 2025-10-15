<template>
  <q-dialog
    ref="dialogRef"
    transition-show="jump-up"
    transition-hide="jump-down"
    @hide="onDialogHide"
  >
    <q-card class="q-dialog-plugin" style="min-width: 500px">
      <go-toolbar-header title="Seleccionar Equipo" />

      <q-card-section class="pt-6">
        <q-tabs
          v-model="currentTab"
          dense
          narrow-indicator
          no-caps
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="select" label="Seleccionar Equipo" icon="la la-shield-alt" />
          <q-tab name="upload" label="Subir Logo" icon="la la-upload" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="currentTab" class="mt-4" animated>
          <!-- Panel: Seleccionar Equipo -->
          <q-tab-panel name="select" class="q-pa-none">
            <div class="space-y-4">
              <p class="text-sm text-gray-600">Equipos de todas las ligas disponibles</p>

              <team-selector
                v-model="selectedTeamLabel"
                league-type="all"
                @team-selected="onTeamSelected"
              />

              <!-- Preview del equipo seleccionado -->
              <div v-if="selectedTeamOption" class="mt-6">
                <div class="text-sm font-semibold text-gray-700 mb-2">Vista previa</div>
                <div class="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg">
                  <q-avatar size="60px">
                    <img :src="selectedTeamOption.logo" alt="team logo" />
                  </q-avatar>
                  <div>
                    <div class="text-lg font-bold">{{ selectedTeamOption.label }}</div>
                    <div class="text-sm text-gray-500">{{ selectedTeamOption.description }}</div>
                  </div>
                </div>
              </div>
            </div>
          </q-tab-panel>

          <!-- Panel: Subir Logo -->
          <q-tab-panel name="upload" class="q-pa-none">
            <div class="space-y-4">
              <image-uploader
                v-model="uploadedLogo"
                title="Sube un logo personalizado para tu equipo"
                upload-text="Arrastra el logo o haz clic aquí"
                hint-text="PNG, JPG hasta 2MB"
                :max-size-m-b="2"
                image-fit="cover"
                @uploaded="onLogoUploaded"
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
import { TeamSelector } from 'src/modules/lineup-builder/components/TeamSelector';
import { ImageUploader } from 'src/modules/shared/components/ImageUploader';
import type { TeamSelectOption } from 'src/modules/lineup-builder/constants/team.constant';
import { useLineupStore } from 'stores/useLineupStore';
import { storeToRefs } from 'pinia';

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
const $q = useQuasar();
const lineupStore = useLineupStore();
const { lineupTeam } = storeToRefs(lineupStore);

// Estado
const currentTab = ref<'select' | 'upload'>('select');
const selectedTeamLabel = ref<string | null>(lineupTeam.value?.label || null);
const selectedTeamOption = ref<TeamSelectOption | null>(lineupTeam.value);
const uploadedLogo = ref<string | null>(null);

// Computed
const hasSelection = computed(() => {
  return !!selectedTeamOption.value || !!uploadedLogo.value;
});

// Handlers
const onTeamSelected = (team: TeamSelectOption) => {
  selectedTeamOption.value = team;
};

const onLogoUploaded = (url: string) => {
  console.log('✅ Logo subido:', url);
};

const onUploadError = (message: string) => {
  $q.notify({
    type: 'negative',
    message: message,
    position: 'top',
  });
};

const onConfirm = () => {
  if (currentTab.value === 'select' && selectedTeamOption.value) {
    // Guardar el equipo seleccionado en el store
    lineupStore.lineupTeam = selectedTeamOption.value;

    onDialogOK({
      type: 'team',
      team: selectedTeamOption.value,
      logo: selectedTeamOption.value.logo,
    });
  } else if (currentTab.value === 'upload' && uploadedLogo.value) {
    // Crear un equipo personalizado con el logo subido
    const customTeam: TeamSelectOption = {
      label: 'Equipo Personalizado',
      value: 'custom-team',
      description: 'Logo personalizado',
      logo: uploadedLogo.value,
      leagueId: 0,
      teamId: 0,
      color: '',
      icon: '',
      type: 'kings',
    };

    // Guardar en el store
    lineupStore.lineupTeam = customTeam;

    onDialogOK({
      type: 'custom',
      team: customTeam,
      logo: uploadedLogo.value,
    });
  }
};
</script>

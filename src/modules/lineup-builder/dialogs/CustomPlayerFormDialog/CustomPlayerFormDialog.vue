<template>
  <q-dialog
    ref="dialogRef"
    transition-show="jump-up"
    transition-hide="jump-down"
    @hide="onDialogHide"
  >
    <q-card class="q-dialog-plugin" style="min-width: 500px">
      <go-toolbar-header :title="mode === 'create' ? 'Crear Jugador' : 'Editar Jugador'" />

      <q-card-section class="pt-6">
        <q-form ref="formRef" class="space-y-4">
          <!-- Foto del Jugador -->
          <div class="space-y-3">
            <div class="text-sm font-semibold text-gray-700 text-center">Foto del Jugador</div>

            <image-uploader
              v-model="formData.profileImageUrl"
              hint-text="PNG, JPG hasta 5MB"
              image-fit="contain"
              :fallback-image="emptyPlayerImage"
              :max-size-m-b="2"
            />
          </div>

          <q-separator />

          <!-- Nombres -->
          <div class="grid grid-cols-2 gap-4">
            <q-input
              v-model="formData.firstName"
              dense
              outlined
              hide-hint
              label="Nombre *"
              name="firstName"
              :rules="[(val) => !!val || 'El nombre es requerido']"
            />
            <q-input
              v-model="formData.lastName"
              dense
              outlined
              hide-hint
              label="Apellido *"
              name="lastName"
              :rules="[(val) => !!val || 'El apellido es requerido']"
            />
          </div>

          <!-- Nickname -->
          <q-input
            v-model="formData.nickname"
            dense
            outlined
            label="Apodo"
            name="nickname"
            hint="Ej: 'Furby', 'El Camello', etc."
          />

          <!-- Market Value y Rating -->
          <div class="grid grid-cols-2 gap-4">
            <q-input
              v-model.number="formData.marketValue"
              dense
              outlined
              type="number"
              label="Salario"
              name="marketValue"
              :hint="currency.hint"
              :prefix="currency.symbol"
              :rules="[
                (val) =>
                  val === null || val === undefined || val >= 0 || 'Debe ser mayor o igual a 0',
              ]"
            />
            <q-input
              v-model.number="formData.rating"
              dense
              outlined
              no-error-icon
              type="number"
              label="Rating"
              name="rating"
              hint="Del 1 al 10 (decimales permitidos)"
              step="0.01"
              :rules="[
                (val) =>
                  val === null ||
                  val === undefined ||
                  (val >= 1 && val <= 10) ||
                  'Debe estar entre 1 y 10',
              ]"
            />
          </div>

          <!-- Posición -->
          <q-select
            v-model="formData.position"
            dense
            outlined
            emit-value
            map-options
            no-error-icon
            label="Posición *"
            name="position"
            hint="Selecciona la posición del jugador"
            option-value="abbreviation"
            option-label="label"
            dropdown-icon="la la-caret-down"
            :options="positionOptions"
            :rules="[(val) => !!val || 'La posición es requerida']"
          >
            <template #prepend>
              <q-icon name="la la-map-marker" />
            </template>
          </q-select>

          <!-- Tipo de liga -->
          <q-select
            v-model="formData.leagueType"
            dense
            outlined
            emit-value
            map-options
            label="Liga *"
            name="leagueType"
            hint="Kings League o Queens League"
            option-value="value"
            option-label="label"
            dropdown-icon="la la-caret-down"
            :options="leagueTypeOptions"
            :rules="[(val) => !!val || 'La liga es requerida']"
            @update:model-value="handleLeagueTypeChange"
          >
            <template #prepend>
              <q-icon name="la la-trophy" />
            </template>
          </q-select>

          <!-- Equipo -->
          <team-selector
            v-model="formData.team"
            :league-type="formData.leagueType"
            @team-selected="handleTeamSelected"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="pb-4 pr-4">
        <q-btn color="primary" no-caps flat label="Cancelar" @click="onDialogCancel" />
        <q-btn
          color="primary"
          no-caps
          unelevated
          :label="mode === 'create' ? 'Crear Jugador' : 'Guardar cambios'"
          :loading="isSaving"
          @click="onSaveClick"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useDialogPluginComponent, QForm } from 'quasar';
import { storeToRefs } from 'pinia';
import { GoToolbarHeader } from 'src/modules/shared/components/GoToolbarHeader';
import TeamSelector from 'src/modules/lineup-builder/components/TeamSelector/TeamSelector.vue';
import { ImageUploader } from 'src/modules/shared/components/ImageUploader';
import { useLineupStore } from 'stores/useLineupStore';
import {
  LIST_OPTIONS as POSITION_LIST,
  type PlayerPositionSelectOption,
} from 'src/modules/lineup-builder/constants/playerPosition.constant';
import type { TeamSelectOption } from 'src/modules/lineup-builder/constants/team.constant';
import { LIST_OPTIONS as LEAGUE_LIST } from 'src/modules/lineup-builder/constants/league.constant';
import { useCustomEntitiesStore } from 'stores/useCustomEntitiesStore';
import { useFeedback } from 'src/modules/shared/composables/useFeedback';
import emptyPlayerImage from 'src/assets/player/empty-player.png';
import type { LEAGUE_TYPES, SelectOption } from 'src/modules/lineup-builder/types';
import type { CustomPlayer } from 'src/modules/lineup-builder/types/custom-entities.types';
import type {
  PlayerPosition,
  PlayerPositionAbbreviation,
} from 'src/modules/players/domain/value-objects/player-position.enum';

interface Props {
  player?: CustomPlayer;
  mode: 'create' | 'edit';
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
});

defineEmits([...useDialogPluginComponent.emits]);

const lineupStore = useLineupStore();
const customEntitiesStore = useCustomEntitiesStore();
const feedback = useFeedback();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const { currency } = storeToRefs(lineupStore);

const formRef = ref<QForm | null>(null);
const isSaving = ref(false);

// Opciones de tipo de liga (filtrar solo kings y queens)
const leagueTypeOptions = computed<SelectOption[]>(() => {
  return LEAGUE_LIST.filter((league) => league.value === 'kings' || league.value === 'queens');
});

// Form data
const formData = reactive<{
  firstName: string;
  lastName: string;
  nickname: string;
  marketValue: number | null;
  rating: number | null;
  team: string;
  teamLogo: string;
  leagueId: number | null;
  teamId: number | null;
  profileImageUrl: string;
  position: string;
  leagueType: Exclude<LEAGUE_TYPES, 'all'>;
}>({
  firstName: props.player?.firstName || '',
  lastName: props.player?.lastName || '',
  nickname: props.player?.nickname || '',
  marketValue: props.player?.marketValue || null,
  rating: props.player?.rating || null,
  team: props.player?.team || '',
  teamLogo: props.player?.teamLogo || '',
  leagueId: props.player?.leagueId || null,
  teamId: props.player?.teamId || null,
  profileImageUrl: props.player?.profileImageUrl || '',
  position: props.player?.positionAbbreviation || '',
  leagueType: props.player?.isQueensLeaguePlayer ? 'queens' : 'kings',
});

// Opciones de posición
const positionOptions = computed<PlayerPositionSelectOption[]>(() => {
  return POSITION_LIST.filter(
    (pos) => pos.type === 'all' || pos.type === formData.leagueType,
  ).filter((pos) => pos.value !== ''); // Excluir "Todas las posiciones"
});

// Manejar selección de equipo desde TeamSelector
const handleTeamSelected = (team: TeamSelectOption) => {
  formData.teamLogo = team.logo;
  formData.teamId = team.teamId;
  formData.leagueId = team.leagueId;
};

// Manejar cambio de tipo de liga
const handleLeagueTypeChange = () => {
  // Resetear equipo al cambiar de liga
  formData.team = '';
  formData.teamLogo = '';
  formData.leagueId = null;
};

// Guardar cambios
async function onSaveClick() {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  isSaving.value = true;

  try {
    // Preparar los datos completos del jugador (PlayerDto)
    const timestamp = new Date().toISOString();
    const playerData: Omit<CustomPlayer, 'id' | 'isCustomEntity'> = {
      uuid: `custom-player-uuid-${Date.now()}`,
      slug: `${formData.firstName.toLowerCase()}-${formData.lastName.toLowerCase()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      nickname: formData.nickname || null,
      height: null,
      weight: null,
      isActive: true,
      marketValue: formData.marketValue || null,
      profileImageUrl: formData.profileImageUrl || process.env.DEFAULT_EMPTY_PLAYER_IMAGE,
      position:
        (positionOptions.value.find((p) => p.abbreviation === formData.position)
          ?.value as PlayerPosition) || null,
      positionAbbreviation: (formData.position as PlayerPositionAbbreviation) || null,
      preferredFoot: null,
      jerseyNumber: null,
      birthDate: null,
      nationality: null,
      socialMediaHandle: null,
      isWildCard: false,
      isQueensLeaguePlayer: formData.leagueType === 'queens',
      wildCardType: null,
      wildCardDescription: null,
      formerTeam: null,
      referenceId: null,
      referenceUrl: null,
      rating: formData.rating || null,
      league: null,
      team: formData.team,
      teamId: formData.teamId || 0,
      teamLogo: formData.teamLogo || '',
      leagueId: formData.leagueId || null,
      teamUuid: '',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    if (props.mode === 'create') {
      // Crear nuevo jugador personalizado
      const newPlayer = customEntitiesStore.addCustomPlayer(playerData);
      feedback.success({ message: 'Jugador creado exitosamente' });
      onDialogOK(newPlayer);
    } else if (props.player) {
      // Actualizar jugador existente
      customEntitiesStore.updateCustomPlayer(props.player.id, playerData);
      feedback.success({ message: 'Jugador actualizado exitosamente' });
      onDialogOK({ ...props.player, ...playerData });
    }
  } catch (error) {
    console.error('Error al guardar:', error);
    feedback.error({ message: 'Error al guardar el jugador' });
  } finally {
    isSaving.value = false;
  }
}
</script>

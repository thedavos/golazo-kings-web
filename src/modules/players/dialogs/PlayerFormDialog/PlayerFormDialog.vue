<template>
  <q-dialog
    ref="dialogRef"
    transition-show="jump-up"
    transition-hide="jump-down"
    @hide="onDialogHide"
  >
    <q-card class="q-dialog-plugin" style="min-width: 500px">
      <go-toolbar-header title="Editar Jugador" />

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
              no-error-icon
              label="Nombre *"
              name="firstName"
              :rules="[(val) => !!val || 'El nombre es requerido']"
            />
            <q-input
              v-model="formData.lastName"
              dense
              outlined
              hide-hint
              no-error-icon
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

          <!-- Equipo -->
          <q-select
            v-model="formData.team"
            dense
            outlined
            emit-value
            map-options
            use-input
            label="Equipo"
            name="team"
            hint="Selecciona el equipo del jugador"
            option-value="label"
            option-label="label"
            dropdown-icon="la la-caret-down"
            input-debounce="300"
            :options="teamOptions"
            @filter="filterTeams"
          >
            <template #prepend>
              <q-icon name="la la-shield-alt" />
            </template>
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-avatar size="sm">
                    <img :src="scope.opt.logo" alt="team logo" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template #selected>
              <div v-if="selectedTeam" class="flex items-center gap-2">
                <q-avatar size="xs">
                  <img :src="selectedTeam.logo" alt="selected team logo" />
                </q-avatar>
                <span>{{ selectedTeam.label }}</span>
              </div>
            </template>
          </q-select>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="pb-4 pr-4">
        <q-btn color="primary" no-caps flat label="Cancelar" @click="onDialogCancel" />
        <q-btn
          color="primary"
          no-caps
          unelevated
          label="Guardar cambios"
          :loading="isSaving"
          @click="onSaveClick"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useDialogPluginComponent, QForm } from 'quasar';
import { storeToRefs } from 'pinia';
import { ImageUploader } from 'src/modules/shared/components/ImageUploader';
import { GoToolbarHeader } from 'src/modules/shared/components/GoToolbarHeader';
import { useLineupStore } from 'stores/useLineupStore';
import { useCustomEntitiesStore } from 'stores/useCustomEntitiesStore';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import {
  LIST_OPTIONS as TEAM_LIST,
  type TeamSelectOption,
} from 'src/modules/lineup-builder/constants/team.constant';
import emptyPlayerImage from 'src/assets/player/empty-player.png';

interface Props {
  player: PlayerDto;
  mode: 'create' | 'edit';
}

const props = defineProps<Props>();

defineEmits([...useDialogPluginComponent.emits]);

const customEntitiesStore = useCustomEntitiesStore();
const lineupStore = useLineupStore();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const { currency, players } = storeToRefs(lineupStore);

// Obtener el jugador reactivo del store
const currentPlayer = computed(() => {
  return players.value.find((p) => p.id === props.player.id) || props.player;
});
const formRef = ref<QForm | null>(null);
const isSaving = ref(false);

// Estados para equipo
const teamList = TEAM_LIST.filter((team) =>
  props.player.isQueensLeaguePlayer ? team.type === 'queens' : team.type === 'kings',
);
const teamOptions = ref<TeamSelectOption[]>(teamList);

// Form data - inicializado con los datos del jugador reactivo del store
const formData = reactive({
  firstName: currentPlayer.value.firstName,
  lastName: currentPlayer.value.lastName,
  nickname: currentPlayer.value.nickname || '',
  marketValue: currentPlayer.value.marketValue || null,
  rating: currentPlayer.value.rating || null,
  team: currentPlayer.value.team || '',
  profileImageUrl: currentPlayer.value.profileImageUrl || '',
});

// Sincronizar formData cuando currentPlayer cambie (reactividad del store)
watch(
  currentPlayer,
  (newPlayer) => {
    formData.firstName = newPlayer.firstName;
    formData.lastName = newPlayer.lastName;
    formData.nickname = newPlayer.nickname || '';
    formData.marketValue = newPlayer.marketValue || null;
    formData.rating = newPlayer.rating || null;
    formData.team = newPlayer.team || '';
    formData.profileImageUrl = newPlayer.profileImageUrl || '';
  },
  { deep: true },
);

// Computed: Equipo seleccionado
const selectedTeam = computed(() => {
  return teamList.find((team) => team.label === formData.team);
});

// Filtrar equipos
const filterTeams = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    if (val === '') {
      teamOptions.value = teamList;
    } else {
      const needle = val.toLowerCase();
      teamOptions.value = teamList.filter((team) => team.label.toLowerCase().includes(needle));
    }
  });
};

// Guardar cambios
async function onSaveClick() {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  isSaving.value = true;

  try {
    // Obtener información del equipo seleccionado
    const teamInfo = selectedTeam.value;

    // Preparar los datos actualizados
    const updatedPlayer: Partial<PlayerDto> = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      nickname: formData.nickname || null,
      marketValue: formData.marketValue || null,
      rating: formData.rating || null,
      team: formData.team,
      teamId: selectedTeam.value?.teamId || 0,
      teamLogo: teamInfo?.logo || '',
      leagueId: teamInfo?.leagueId || null,
      profileImageUrl: formData.profileImageUrl || process.env.DEFAULT_EMPTY_PLAYER_IMAGE,
    };

    // ✅ Persistir los cambios en IndexedDB vía store
    if (props.player.isCustomEntity) {
      customEntitiesStore.updateCustomPlayer(props.player.id, updatedPlayer);
    } else {
      lineupStore.modifyPlayer(props.player.id, updatedPlayer);
    }

    // Retornar los datos actualizados (para compatibilidad con código existente)
    onDialogOK({
      ...props.player,
      ...updatedPlayer,
    });
  } catch (error) {
    console.error('Error al guardar:', error);
  } finally {
    isSaving.value = false;
  }
}
</script>

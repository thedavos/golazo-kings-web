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

            <!-- Input file (siempre presente, oculto) -->
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileChange"
            />

            <!-- Modo: CON foto (Editar) -->
            <div v-if="hasPhoto" class="relative">
              <div
                class="relative w-48 h-48 mx-auto rounded-lg border-2 border-gray-300 overflow-hidden group cursor-pointer transition-all hover:border-primary"
                @click="openFileSelector"
              >
                <!-- Imagen actual -->
                <q-img :src="displayImageUrl" fit="contain" class="w-full h-full">
                  <template #loading>
                    <div class="absolute-full flex items-center justify-center bg-gray-100">
                      <q-spinner color="primary" size="md" />
                    </div>
                  </template>
                  <template #error>
                    <q-img :src="emptyPlayerImage" fit="contain" class="w-full h-full" />
                  </template>
                </q-img>

                <!-- Overlay con iconos al hacer hover -->
                <div
                  class="absolute inset-0 bg-black opacity-0 group-hover:opacity-70 transition-all duration-300 flex items-center justify-center gap-4 pointer-events-none"
                >
                  <div class="flex gap-6">
                    <!-- Icono Editar - NO hace nada, el click pasa a través -->
                    <div class="flex flex-col items-center text-white">
                      <q-icon name="la la-edit" size="md" />
                      <span class="text-xs mt-1">Cambiar</span>
                    </div>
                    <!-- Icono Eliminar - SÍ captura el click -->
                    <div
                      class="flex flex-col items-center text-white cursor-pointer pointer-events-auto"
                      @click.stop="removePhoto"
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
                      Arrastra una imagen o haz clic aquí
                    </p>
                    <p class="text-xs text-gray-500 mt-1">PNG, JPG hasta 5MB</p>
                  </div>
                </div>
              </div>

              <!-- Opción URL (secundaria) -->
              <div class="text-center">
                <button
                  type="button"
                  class="text-sm text-primary hover:underline"
                  @click="showUrlInput = true"
                >
                  o pegar una URL
                </button>
              </div>

              <!-- Input URL (toggle) -->
              <transition name="fade">
                <div v-if="showUrlInput" class="pt-2">
                  <q-input
                    v-model="urlInputValue"
                    dense
                    outlined
                    name="urlInput"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    hint="Pega la URL de la imagen del jugador"
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
                      <q-btn
                        flat
                        dense
                        round
                        size="sm"
                        icon="la la-times"
                        @click="cancelUrlInput"
                      />
                    </template>
                  </q-input>
                </div>
              </transition>
            </div>
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
            hint="Ej: 'CR7', 'La Pulga', etc."
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
import emptyPlayerImage from 'src/assets/player/empty-player.png';
import { GoToolbarHeader } from 'src/modules/shared/components/GoToolbarHeader';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import {
  LIST_OPTIONS as TEAM_LIST,
  type TeamSelectOption,
} from 'src/modules/lineup-builder/constants/team.constant';
import { useLineupStore } from 'stores/useLineupStore';
import { storeToRefs } from 'pinia';

interface Props {
  player: PlayerDto;
  mode: 'create' | 'edit';
}

const props = defineProps<Props>();

defineEmits([...useDialogPluginComponent.emits]);

const lineupStore = useLineupStore();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const { currency, players } = storeToRefs(lineupStore);

// Obtener el jugador reactivo del store
const currentPlayer = computed(() => {
  return players.value.find((p) => p.id === props.player.id) || props.player;
});
const formRef = ref<QForm | null>(null);
const isSaving = ref(false);

// Estados para gestión de foto
const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const showUrlInput = ref(false);
const urlInputValue = ref('');

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

// Computed: URL de la imagen a mostrar (foto o placeholder)
const displayImageUrl = computed(() => {
  return formData.profileImageUrl || emptyPlayerImage;
});

// Computed: ¿Tiene foto?
const hasPhoto = computed(() => {
  return !!formData.profileImageUrl;
});

// Computed: Equipo seleccionado
const selectedTeam = computed(() => {
  return teamList.find((team) => team.label === formData.team);
});

// Validación de URL
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Procesar archivo y crear preview
const processFile = (file: File) => {
  // Validar tamaño (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('La imagen es demasiado grande. Máximo 5MB.');
    return;
  }

  // Validar tipo
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona una imagen válida.');
    return;
  }

  // Crear preview del archivo
  const reader = new FileReader();
  reader.onload = (event) => {
    formData.profileImageUrl = event.target?.result as string;
  };
  reader.readAsDataURL(file);
};

// Abrir selector de archivos
const openFileSelector = () => {
  fileInputRef.value?.click();
};

// Manejar cambio de archivo desde input
const handleFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    processFile(file);
  }
};

// Manejar drop de archivo
const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  const file = event.dataTransfer?.files[0];
  if (file) {
    processFile(file);
  }
};

// Quitar foto
const removePhoto = () => {
  formData.profileImageUrl = '';
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

// Aplicar URL
const applyUrl = () => {
  if (urlInputValue.value && isValidUrl(urlInputValue.value)) {
    formData.profileImageUrl = urlInputValue.value;
    showUrlInput.value = false;
    urlInputValue.value = '';
  }
};

// Cancelar input de URL
const cancelUrlInput = () => {
  showUrlInput.value = false;
  urlInputValue.value = '';
};

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
      teamLogo: teamInfo?.logo || '',
      leagueId: teamInfo?.leagueId || null,
      profileImageUrl: formData.profileImageUrl || null,
    };

    // ✅ Persistir los cambios en IndexedDB vía store
    lineupStore.modifyPlayer(props.player.id, updatedPlayer);

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

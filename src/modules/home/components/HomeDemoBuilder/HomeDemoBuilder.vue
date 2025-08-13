<template>
  <section class="py-16 bg-gradient-to-br from-slate-800/50 to-slate-900/30">
    <div class="container mx-auto px-6">
      <div class="text-center mb-12">
        <h2 class="text-4xl text-primary font-bold mb-4">Demo Interactivo</h2>
        <p class="text-xl text-gray-300 mb-2">¡Prueba el constructor ahora sin registrarte!</p>
        <p class="text-lg text-blue-400">
          Arrastra jugadores al campo y gestiona tu presupuesto de €4000
        </p>
      </div>

      <div class="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <!-- Available Players -->
        <div class="lg:col-span-1">
          <q-card class="bg-slate-800/50 border border-blue-500/20 backdrop-blur-sm p-6 h-fit">
            <div class="flex items-center gap-2 mb-4">
              <q-icon name="fas fa-users" class="text-blue-400" size="xs" />
              <h3 class="text-xl font-bold text-white">Jugadores Estrella</h3>
            </div>

            <div class="space-y-3 max-h-[340px] overflow-y-auto pr-2">
              <player-card-mini
                v-for="player in demoPlayers"
                :key="player.id"
                :player="player"
                @drag-start="handleDragStart"
              />
            </div>
          </q-card>
        </div>

        <!-- Football Field -->
        <div class="lg:col-span-1">
          <q-card class="bg-slate-800/50 border border-blue-500/20 backdrop-blur-sm p-6 h-fit">
            <demo-field
              :lineup="lineup"
              :field-positions="currentFieldPositions"
              :selected-league="selectedLeague"
              @drop-player="handleDrop"
              @remove-player="removePlayer"
            />
          </q-card>
        </div>

        <!-- Budget & Stats -->
        <div class="lg:col-span-1 space-y-4">
          <q-card class="bg-slate-800/50 border border-blue-500/20 backdrop-blur-sm p-6">
            <div class="space-y-4">
              <!-- League Selector -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Liga</label>
                <q-select
                  v-model="selectedLeagueValue"
                  name="selectLeague"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  outlined
                  dense
                  color="blue"
                  bg-color="slate-700"
                  class="text-white"
                  dropdown-icon="fa fa-caret-down"
                  popup-content-class="bg-slate-800 text-white"
                  :options="leagueOptions"
                >
                  <template #option="{ opt, selected, toggleOption }">
                    <q-item
                      :active="selected"
                      @click="toggleOption(opt)"
                      clickable
                      class="hover:bg-slate-600"
                    >
                      <q-item-section avatar>
                        <q-icon :name="opt.icon" :class="opt.color" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-white">{{ opt.label }}</q-item-label>
                        <q-item-label caption class="text-gray-400">{{
                          opt.description
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>

                  <template #selected-item="{ opt }">
                    <div class="flex items-center gap-2">
                      <q-icon :name="opt.icon" :class="opt.color" size="sm" />
                      <span class="text-white">{{ opt.label }}</span>
                    </div>
                  </template>
                </q-select>
              </div>
              <!-- Formation Selector -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Formación</label>
                <q-select
                  v-model="selectedFormation"
                  name="selectFormation"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  outlined
                  dense
                  color="blue"
                  bg-color="slate-700"
                  class="text-white"
                  dropdown-icon="fa fa-caret-down"
                  popup-content-class="bg-slate-800 text-white"
                  :options="formationOptions"
                >
                  <template #option="{ opt, selected, toggleOption }">
                    <q-item
                      :active="selected"
                      @click="toggleOption(opt)"
                      clickable
                      class="hover:bg-slate-600"
                    >
                      <q-item-section>
                        <q-item-label class="text-white">{{ opt.label }}</q-item-label>
                        <q-item-label caption class="text-gray-400">{{
                          opt.description
                        }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-badge :label="opt.players" color="blue" outline />
                      </q-item-section>
                    </q-item>
                  </template>

                  <template #selected-item="{ opt }">
                    <span class="text-white">{{ opt.label }}</span>
                  </template>
                </q-select>
              </div>
            </div>
          </q-card>
          <budget-card-mini :total-cost="totalCost" :remaining-budget="remainingBudget" />
          <lineup-status-card-mini
            :lineup="lineup"
            :total-positions="playersInFormation"
            :selected-formation="selectedFormation"
          />
          <!--          <q-btn size="md" rounded color="primary" class="w-full" @click="$emit('startBuilding')">-->
          <!--            <q-icon name="fa fa-arrow-right" class="mr-2" />-->
          <!--            ¡Crear mi primera alineación!-->
          <!--          </q-btn>-->
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { PlayerCardMini } from 'src/modules/players/components/PlayerCard';
import { BudgetCardMini } from 'src/modules/budget/components/BudgetCard';
import { LineupStatusCardMini } from 'src/modules/lineup-builder/components/LineupStatusCard';
import { DemoField } from 'src/modules/lineup-builder/components/LineupField';
import {
  FORMATION_CONFIGURATION as formationConfiguration,
  FORMATION_OPTIONS as formationOptions,
} from 'src/modules/lineup-builder/components/LineupField';
import {
  LEAGUE_OPTIONS as leagueOptions,
  LEAGUE_OPTION_DEFAULT as leagueOptionDefault,
} from 'src/modules/home/components/HomeDemoBuilder';
import kingsPlayers from './kings-players.json';
// import queensPlayers from './queens-players.json';
import type { LeagueOption } from 'src/modules/home/components/HomeDemoBuilder';
import type { FormationName } from 'src/modules/lineup-builder/components/LineupField';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';
import type { PlayerPosition } from 'src/modules/players/domain/value-objects/player-position.enum';

// Emits
defineEmits(['startBuilding']);

// Demo data
const demoPlayers = [...(kingsPlayers as PlayerDto[])];

// Reactive state
const selectedLeagueValue = ref<string>(leagueOptionDefault.value);
const selectedFormation = ref<FormationName>('4-2-0');
const lineup = ref<Record<string, PlayerDto>>({});
const draggedPlayer = ref<PlayerDto | null>(null);

// Computed properties
const selectedLeague = computed<LeagueOption>(
  () =>
    leagueOptions.find((league) => league.value === selectedLeagueValue.value) ||
    leagueOptionDefault,
);

const currentFieldPositions = computed(() => {
  return formationConfiguration[selectedFormation.value] || formationConfiguration['4-2-0'];
});

const totalCost = computed(() => {
  return Object.values(lineup.value).reduce((sum, player) => sum + (player.marketValue || 0), 0);
});

const remainingBudget = computed(() => {
  return 4000 - totalCost.value;
});

const playersInFormation = computed<number>(() => currentFieldPositions.value.length);

// Methods
const handleDragStart = (player: PlayerDto) => {
  draggedPlayer.value = player;
};

const handleDrop = (positionId: string, position: PlayerPosition) => {
  if (draggedPlayer.value && draggedPlayer.value.position === position) {
    lineup.value = { ...lineup.value, [positionId]: draggedPlayer.value };
    draggedPlayer.value = null;
  }
};

const removePlayer = (positionId: string) => {
  const newLineup = { ...lineup.value };
  delete newLineup[positionId as keyof typeof newLineup];
  lineup.value = newLineup;
};
</script>

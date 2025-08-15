import { computed, ref } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import type { PlayerDto } from 'src/modules/players/dtos/player.dto';

function useDemoBuilder() {
  const lineup = ref<Record<string, PlayerDto>>({});
  const bench = ref<Record<string, PlayerDto>>({});
  const budgetAmount = ref(4000);

  const remainingBudget = computed(() => {
    return budgetAmount.value - totalCost.value;
  });

  const totalCost = computed(() => {
    const lineupCost = Object.values(lineup.value).reduce(
      (sum, player) => sum + (player?.marketValue || 0),
      0,
    );
    const benchCost = Object.values(bench.value).reduce(
      (sum, player) => sum + (player?.marketValue || 0),
      0,
    );

    return lineupCost + benchCost;
  });

  return {
    lineup,
    bench,
    budgetAmount,
    remainingBudget,
    totalCost,
  };
}

export const useSharedDemoBuilder = createSharedComposable(useDemoBuilder);

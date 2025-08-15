<template>
  <q-card class="bg-slate-800/50 border border-blue-500/20 backdrop-blur-sm p-6">
    <div class="flex items-center gap-2 mb-4">
      <q-icon name="fas fa-dollar-sign" class="text-yellow-400" size="sm" />
      <h3 class="text-xl font-bold text-white">Presupuesto</h3>
    </div>

    <div class="space-y-3">
      <div class="flex justify-between">
        <span class="text-gray-400">Presupuesto Total</span>
        <span class="text-white font-semibold">{{ formatter(budgetAmount) }}</span>
      </div>

      <div class="flex justify-between">
        <span class="text-gray-400">Gastado</span>
        <span class="text-white font-semibold">{{ formatter(totalCost) }}</span>
      </div>

      <div class="flex justify-between">
        <span class="text-gray-400">Disponible</span>
        <span
          :class="remainingBudget < 0 ? 'text-red-400' : 'text-yellow-400'"
          class="font-semibold"
        >
          {{ formatter(remainingBudget) }}
        </span>
      </div>

      <!-- Progress bar -->
      <div class="w-full bg-slate-700 rounded-full h-3">
        <div
          :class="remainingBudget < 0 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-blue-600'"
          class="h-3 rounded-full transition-all duration-300"
          :style="{ width: `${Math.min((totalCost / budgetAmount) * 100, 100)}%` }"
        />
      </div>

      <div class="flex justify-between text-sm">
        <span class="text-gray-400">{{ currencyOption.symbol }}0</span>
        <span class="text-gray-400">{{ formatter(budgetAmount) }}</span>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import type { CurrencyOption } from 'src/modules/home/components/HomeDemoBuilder';

interface Props {
  totalCost: number;
  remainingBudget: number;
  budgetAmount: number;
  currencyOption: CurrencyOption;
  formatter: (amount: number) => string;
}

defineProps<Props>();
</script>

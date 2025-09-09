<template>
  <q-header class="bg-transparent absolute">
    <div class="container mx-auto py-2">
      <q-toolbar>
        <q-toolbar-title class="flex items-center md:justify-center gap-2">
          <q-avatar>
            <q-img class="w-14 h-14" fit="cover" siz src="src/assets/golazo_kings_logo.png" />
          </q-avatar>
          <div>
            <h1 class="text-2xl font-bold text-gradient-gold">GolazoKings</h1>
            <p class="text-xs text-gray-400 uppercase tracking-wider m-0">
              Constructor Kings League
            </p>
          </div>
        </q-toolbar-title>

        <q-btn flat round icon="fa fa-bars" class="block md:hidden" @click="$emit('open-menu')" />
      </q-toolbar>

      <q-toolbar inset class="hidden md:flex justify-center mt-3">
        <q-tabs
          v-model="activeTab"
          dense
          no-caps
          inline-label
          narrow-indicator
          content-class="text-2px"
          indicator-color="transparent"
          active-bg-color="primary"
          class="text-white border-2 border-go-gold rounded-2xl"
        >
          <q-route-tab v-for="tab in tabs" :key="tab.name" :name="tab.name" :to="tab.to">
            <q-icon :name="tab.icon" :size="tab.iconSize" />
            <p class="my-auto ml-2 text-sm">{{ tab.label }}</p>
          </q-route-tab>
        </q-tabs>
      </q-toolbar>
    </div>
  </q-header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { HOME_TABS_CONFIG as tabs } from './tabs';

defineEmits(['open-menu']);

const activeTab = ref('home');
</script>

<template>
  <q-header class="relative bg-bg-primary/95 backdrop-blur-md border-b border-go-blue/30">
    <div class="container mx-auto py-4">
      <q-toolbar>
        <q-toolbar-title class="flex items-center md:justify-center gap-2">
          <q-avatar>
            <q-img class="w-10 h-10" fit="fill" siz src="src/assets/golazo_kings_logo.svg" />
          </q-avatar>
          <div>
            <h1 class="text-2xl font-bold text-gradient">GolazoKings</h1>
            <p class="text-xs text-gray-400 uppercase tracking-wider m-0">
              Constructor Kings League
            </p>
          </div>
        </q-toolbar-title>

        <q-btn flat round icon="fa fa-bars" class="block md:hidden" @click="$emit('open-menu')" />
      </q-toolbar>

      <q-toolbar inset class="hidden md:flex justify-center mt-4">
        <q-tabs
          dense
          no-caps
          inline-label
          narrow-indicator
          content-class="text-2px"
          indicator-color="transparent"
          active-bg-color="primary"
          class="text-white border border-go-blue/30 rounded-2xl"
        >
          <q-tab v-for="tab in tabs" :key="tab.name" :name="tab.name">
            <q-icon :name="tab.icon" :size="tab.iconSize" />
            <p class="my-auto ml-2 text-sm">{{ tab.label }}</p>
          </q-tab>
        </q-tabs>
      </q-toolbar>
    </div>
  </q-header>
</template>

<script setup lang="ts">
import { HOME_TABS_DATA as tabs } from './tabs';

defineEmits(['open-menu']);
</script>

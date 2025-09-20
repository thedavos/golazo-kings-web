<template>
  <q-header class="absolute bg-transparent">
    <div class="flex flex-nowrap container mx-auto">
      <q-toolbar>
        <q-toolbar-title class="flex items-center">
          <!--          <q-avatar>-->
          <!--            <q-img class="w-14 h-14" fit="cover" siz src="src/assets/golazo_kings_logo.png" />-->
          <!--          </q-avatar>-->
          <h1 class="text-2xl font-bold text-primary cursor-pointer">GolazoKings</h1>
        </q-toolbar-title>

        <q-btn flat round icon="fa fa-bars" class="block md:hidden" @click="$emit('open-menu')" />
      </q-toolbar>

      <q-toolbar inset class="hidden md:flex justify-center items-center mt-3">
        <q-tabs
          v-model="activeTab"
          dense
          no-caps
          inline-label
          narrow-indicator
          content-class="text-2px"
          indicator-color="transparent"
          active-bg-color="transparent"
          active-class="text-primary"
          class="text-dark bg-surface-default"
        >
          <q-route-tab v-for="tab in tabs" :key="tab.name" :name="tab.name" :to="tab.to">
            <q-icon v-if="tab.icon" :name="tab.icon" :size="tab.iconSize" />
            <p class="my-auto text-">{{ tab.label }}</p>
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

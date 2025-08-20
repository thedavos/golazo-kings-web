<template>
  <q-layout view="hHh lpR fFf" class="min-h-screen bg-background">
    <home-header @open-menu="drawerRight = true" />

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-drawer v-model="drawerRight" side="right" behavior="mobile">
      <q-scroll-area class="fit bg-gray-800">
        <q-toolbar>
          <q-toolbar-title class="flex items-center"> Menú </q-toolbar-title>

          <q-btn flat round dense icon="fa fa-close" color="white" @click="drawerRight = false" />
        </q-toolbar>

        <q-list separator bordered padding>
          <q-item v-for="tab in tabs" :key="tab.name" clickable v-ripple>
            <q-item-section avatar>
              <q-icon :name="tab.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ tab.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-drawer v-model="drawerLeft" bordered overlay side="left" behavior="desktop">
      <q-scroll-area
        class="fit bg-secondary text-white"
        :vertical-bar-style="{ background: 'primary' }"
      >
        <player-sidebar-content @close-sidebar="drawerLeft = false" />
      </q-scroll-area>
    </q-drawer>
  </q-layout>
</template>

<script setup lang="ts">
import { useSharedMainLayout } from 'src/modules/shared/composables/useMainLayout';
import { HOME_TABS_CONFIG as tabs } from 'src/modules/home/components/HomeHeader';
import { HomeHeader } from 'src/modules/home/components/HomeHeader';
import { PlayerSidebarContent } from 'src/modules/players/components/PlayerSidebarContent';

const { drawerRight, drawerLeft } = useSharedMainLayout();
</script>

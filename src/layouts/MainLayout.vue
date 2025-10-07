<template>
  <q-layout view="lHh lpR fff" class="min-h-screen bg-surface-default text-white">
    <home-header @open-menu="drawerRight = true" />

    <q-page-container class="flex flex-col h-full">
      <div class="flex-1">
        <router-view />
      </div>
      <home-footer />
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

    <q-drawer
      v-model="drawerLeft"
      bordered
      overlay
      side="left"
      behavior="desktop"
      :width="leftDrawerWidth"
    >
      <q-scroll-area
        class="fit bg-secondary text-white"
        :vertical-bar-style="{ background: 'primary' }"
      >
        <player-sidebar-content @close-sidebar="drawerLeft = false" />
      </q-scroll-area>
    </q-drawer>

    <!-- Banner de consentimiento de cookies -->
    <cookie-consent />
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useWindowSize } from '@vueuse/core';
import { useSharedMainLayout } from 'src/modules/shared/composables/useMainLayout';
import { HOME_TABS_CONFIG as tabs } from 'src/modules/home/components/HomeHeader';
import { HomeHeader } from 'src/modules/home/components/HomeHeader';
import { HomeFooter } from 'src/modules/home/components/HomeFooter';
import { PlayerSidebarContent } from 'src/modules/players/components/PlayerSidebarContent';
import { CookieConsent } from 'src/modules/ads/components';

const { drawerRight, drawerLeft } = useSharedMainLayout();
const { width } = useWindowSize();
const $q = useQuasar();

const leftDrawerWidth = ref(300);

onMounted(() => {
  const isPad = $q.screen.lt.md;
  const isMobile = $q.screen.lt.sm;

  if (isMobile) {
    leftDrawerWidth.value = width.value;
    return;
  }

  if (isPad) {
    leftDrawerWidth.value = Math.ceil(width.value / 2);
    return;
  }

  const builderContainer = document.querySelector('#builder-container');
  const builderConfigurationSection = document.querySelector('#builder-configuration');

  if (builderContainer && builderConfigurationSection) {
    const builderContainerPaddingLeft = window
      .getComputedStyle(builderContainer as HTMLElement)
      .getPropertyValue('padding-left')
      .replace('px', '');
    const builderContainerMarginLeft = window
      .getComputedStyle(builderContainer as HTMLElement)
      .getPropertyValue('margin-left')
      .replace('px', '');
    const builderConfigurationSectionWidth = window
      .getComputedStyle(builderConfigurationSection as HTMLElement)
      .getPropertyValue('width')
      .replace('px', '');

    leftDrawerWidth.value =
      Number(builderContainerPaddingLeft) +
      Number(builderContainerMarginLeft) +
      Number(builderConfigurationSectionWidth);
    return;
  }

  leftDrawerWidth.value = 100;
});
</script>

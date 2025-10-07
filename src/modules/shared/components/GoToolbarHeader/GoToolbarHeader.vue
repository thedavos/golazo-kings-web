<template>
  <q-toolbar class="border-b-border-default border-b-1">
    <q-toolbar-title class="font-semibold">{{ title }}</q-toolbar-title>
    <q-btn flat round dense size="sm" icon="la la-close" v-close-popup />
  </q-toolbar>
</template>

<script setup lang="ts">
defineProps<{ title: string }>();
</script>

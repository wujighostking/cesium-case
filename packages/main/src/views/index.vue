<script setup lang="ts">
import { routesLink } from '@/router'
</script>

<template>
  <div>
    <template v-for="item in routesLink" :key="item.name">
      <router-link :to="item.path" class="mr-4 text-blue-500 hover:underline">
        {{ item.name }}
      </router-link>
    </template>
  </div>
</template>

<style scoped>

</style>

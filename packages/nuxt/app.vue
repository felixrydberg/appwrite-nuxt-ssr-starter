<script setup lang="ts">
  const store = useStore();
  const user = computed(() => store.user);
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

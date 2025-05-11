<script setup lang="ts">
import { NuxtLink } from '#components';

  const store = useStore();
  const user = computed(() => store.user);
</script>

<template>
  
  <div v-if="!user" class="flex flex-col items-center justify-center max-w-lg mx-auto gap-3">
    <text-h1>Welcome to Nuxt Appwrite SSR Starter</text-h1>
    Seems like you are not logged in.
    <NuxtLink to="/login" class="w-full">
      <ui-button to="/auth/login" class="w-full">
        Login
      </ui-button>
    </NuxtLink>
    <NuxtLink to="/register" class="w-full">
      <ui-button to="/auth/register" class="w-full">
        Register
      </ui-button>
    </NuxtLink>
  </div>

  <div v-else>
    <text-h1>Welcome {{ user.name }}</text-h1>
    <text-p class="text-center">
      You are logged in as {{ user.email }}.
    </text-p>
  </div>
</template>

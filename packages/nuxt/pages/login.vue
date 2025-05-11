<script setup lang="ts">
import { Account, AppwriteException } from 'appwrite';

  const store = useStore();
  const email = ref('');
  const emailError = ref('');
  const password = ref('');

  const onSignin = async () => {
    const client = useNuxtApp().$appwrite;
    const account = new Account(client);
    try {
      await account.createEmailPasswordSession(email.value, password.value)
      store.user = await account.get();
    } catch (err) {
      const error = err as AppwriteException;
      switch(error.type) {
        case "user_invalid_credentials":
          emailError.value = "Email or password is incorrect";
          break;
        // If you have enabled multifactor authentication, you can handle that here.
        case "user_more_factors_required":
          break;
        case "user_session_already_exists":
          try {
            store.user = await account.get();
          } catch (err) {
            console.error("Error getting user session:", err);
          }
          break;
      }
    }
  }
</script>

<template>
  <div class="flex flex-col items-center justify-center max-w-lg mx-auto gap-3">
    <text-h1>Login</text-h1>
    <form class="flex flex-col gap-3 p-3 w-full" @submit.prevent="onSignin">
      <ui-input v-model="email" placeholder="Enter your Email" />
      <text-p class="text-sm text-red-500" v-if="emailError">{{ emailError }}</text-p>
      <ui-input v-model="password" placeholder="Enter your Password" />
      <ui-button type="submit" class="w-full">
        Login
      </ui-button>
      <text-p class="text-center">
        Don't have an account? 
        <nuxt-link to="/register" class="text-blue-500">Register</nuxt-link>
      </text-p>
    </form>
  </div>
</template>

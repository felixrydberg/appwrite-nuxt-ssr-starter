<script setup lang="ts">
  import { Account, AppwriteException, ID } from 'appwrite';
import type { User } from '~/types';

  const store = useStore();
  const name = ref('felix');
  const email = ref('felixryd@gmail.com');
  const emailError = ref('');
  const password = ref('Testing1!');
  const passwordError = ref('');
  const passwordConfirm = ref('Testing1!');
  const passwordConfirmError = ref('');

  const onSignup = async () => {
    const client = useNuxtApp().$appwrite;
    const account = new Account(client);
    try {
      if (password.value !== passwordConfirm.value) {
        passwordConfirmError.value = "Passwords do not match";
        return;
      }

      const user = await account.create<User>(
        ID.unique(),
        email.value,
        password.value,
        name.value
      );
      await account.createEmailPasswordSession(email.value, password.value);

      store.user = user;
      navigateTo('/');
    } catch (err) {
      const error = err as AppwriteException;
      switch (error.code) {
        case 409:
          emailError.value = "Email is already registered";
          break;
      }
    }
  };
</script>

<template>
  <div class="flex flex-col items-center justify-center max-w-lg mx-auto gap-3">
    <text-h1>Register</text-h1>
    <form class="flex flex-col gap-3 p-3 w-full" @submit.prevent="onSignup">
      <ui-input v-model="name" placeholder="Enter your Name" type="input" name="name" />
      <ui-input v-model="email" placeholder="Enter your Email" type="input" name="email" />
      <ui-input v-model="password" placeholder="Enter your Password" type="password" name="password" />
      <ui-input v-model="passwordConfirm" placeholder="Confirm your Password" type="password" name="passwordConfirm" />
      <ui-button type="submit" class="w-full">
        Register
      </ui-button>
      <text-p class="text-center">
        Already have an account?
        <nuxt-link to="/login" class="text-blue-500">Login</nuxt-link>
      </text-p>
    </form>
  </div>
</template>

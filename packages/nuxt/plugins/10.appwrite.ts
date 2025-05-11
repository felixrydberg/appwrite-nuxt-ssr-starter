import { Account, AppwriteException } from "appwrite";

const getCookie = () => {
  const name = createCookieName();
  const cookie = useCookie(name);
  return cookie && cookie.value ? cookie : useCookie(name + "_legacy");
}

export default defineNuxtPlugin(async () => {
  const store = useStore();
  const client = getAppwriteClient();

  if (import.meta.server) {
    const cookie = getCookie();
    if (cookie.value) {
      client.setSession(cookie.value);
      const account = new Account(client);
      try {
        store.user = await account.get();
      } catch (err) {
        // Add error handling for your specific use case
        console.log("Error fetching user data:", err);
        const error = err as AppwriteException;
        switch (error.type) {
          case "user_session_already_exists":
          case "user_more_factors_required":
            await account.deleteSession("current");
            cookie.value = null;
            break;
        }
      }
    }
  };

  return {
    provide: {
      appwrite: client,
    }
  }
});
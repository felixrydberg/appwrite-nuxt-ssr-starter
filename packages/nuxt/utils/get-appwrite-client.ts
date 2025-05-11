import { Client } from 'appwrite';

export default () => {
  const client = useNuxtApp().$appwrite as Client;
  if (!client) {
    const Endpoint = useRequestURL().origin;
    const { appwriteProjectId } = useRuntimeConfig().public;
    const client = new Client()
      .setEndpoint(`${Endpoint}/api/service`)
      .setProject(appwriteProjectId);
    
    return client
  } else {
    return client;
  }
}

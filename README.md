# Note:
Only Applicable to Frankfurt hosted Appwrite cloud instances. You will have to change nginx config to match your region for testing.

# Appwrite Nuxt SSR Starter

A starter template for building server-side rendered Nuxt applications with Appwrite authentication that works in both client and server contexts.

## Concept: SSR Authentication with Appwrite

The core challenge this starter solves is enabling Appwrite authentication in a server-side rendered Nuxt application. Traditionally, Appwrite uses client-side auth where the session is stored in a cookie, but this doesn't work automatically with SSR.

### How It Works

1. **Cookie-based Authentication**: 
   - When a user logs in, Appwrite sets an HTTP-only cookie with the session token
   - This cookie is sent with every request to the Appwrite API

2. **Server-Side Rendering Challenge**:
   - During SSR, the Nuxt server needs to read this cookie and use it to authenticate with Appwrite
   - The server then needs to pass authentication data to the client

3. **Solution**:
   - The Nginx proxy rewrites cookie domains to work across environments
   - The Nuxt plugin (`plugins/10.appwrite.ts`) reads the session cookie during SSR
   - The Plugin sets up the Appwrite client and sets the session using the cookie value
   - User data is stored in a shared state accessible to both server and client (Pinia / useState etc.)

```ts
if (import.meta.server) {
  const cookie = getCookie();
  if (cookie.value) {
    client.setSession(cookie.value);
    const account = new Account(client);
    try {
      store.user = await account.get();
    } catch (err) {
      // Error handling...
    }
  }
}
```

## Implementation Details

### 1. Appwrite Client Setup

We use a utility function to create the Appwrite client:

```ts
// utils/get-appwrite-client.ts
export default () => {
  const client = useNuxtApp().$appwrite as Client;
  if (!client) {
    const Endpoint = useRequestURL().origin;
    const { appwriteProjectId } = useRuntimeConfig().public;
    return new Client()
      .setEndpoint(`${Endpoint}/api/service`)
      .setProject(appwriteProjectId);
  }
  return client;
}
```

### 2. Cookie Name Handling

```ts
// utils/create-cookie-name.ts
export default () => {
  const { appwriteProjectId } = useRuntimeConfig().public;
  return `a_session_${appwriteProjectId}`;
};
```

### 3. Nuxt Mount Plugin
```ts
// plugins/10.appwrite.ts
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
```

## Getting Started

### Requirements
- Node.js
- Docker and Docker Compose (for containerized development)

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   cd packages/nuxt
   npm install
   ```

### Development Setup

#### SSL Certificate Setup (Required for Appwrite Cloud)

For local development with HTTPS, generate self-signed SSL certificates:

```bash
# Create the SSL directory
mkdir -p packages/nginx/ssl

# Generate self-signed certificates for development
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout packages/nginx/ssl/key.pem \
  -out packages/nginx/ssl/cert.pem
```

When prompted during certificate creation, use `localhost` as the Common Name.

#### Environment Variables

Create a `.env` file in the project root with your Appwrite credentials:

```
APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1"
APPWRITE_PROJECT_ID="your-project-id"
```

### Running the Application

#### With Docker (Recommended for Appwrite Cloud)

```bash
docker-compose up
```

This will start both the Nuxt application and Nginx proxy server.

#### Without Docker

```bash
cd packages/nuxt
npm run dev
```

## Available Scripts

- `dev`: Starts the development server with hot reloading
- `dev:docker`: Starts the development server in Docker (with certificate handling)
- `dev:host`: Starts the development server with the --host option

## Security Notice

⚠️ **IMPORTANT**: The Nginx and Docker configurations provided are for **development only**. They contain security compromises (self-signed certificates, insecure cookies) that should never be used in production environments.

<!-- 
Original README content:

# Appwrite Nuxt SSR Starter

Ui is made with shadcn/vue along with Tailwindcss v4

Global overview:
- Nuxt will connect to your Appwrite instance and expects a HttpOnly cookie which is valid.
  - This can be achived by using Appwrite Custom Domains
  - Nginx proxy which rewrites the domain on your cookie. For development purposes the secure flag will need to be disabled unless running on localhost. A simple docker setup is provided in the docker-compose, along with the nginx config in packages/nginx. This config is SHOULD NOT be used in production, it will always rewrite secure headers to insecure. If you wish to test this with docker, refeer to the Docker section below.

- When Nuxt renders the page in SSR mode it will read the cookie value. This is the session secret for Appwrite.
- A Client session will be created and provided to Nuxt instance, this client will have the session set by passing it the cookie value through setSession.


Main logic is in the 10.appwrite.ts plugin file. The 10 is just so that Nuxt will load it last, This is not needed when using useState intead of Pinia.
Optional dependencies along with replacements:
- pinia: Nuxt useState


### Nginx Concept
- Nginx will proxy the request to the Appwrite instance, and rewrite the cookie domain to match the domain of your Nuxt app.

## Docker Setup

### Cloud users (SSL Certificate Setup)
If you are using Appwrite Cloud you will need to create certificates, You can find the command above.

For local development with HTTPS, you need to generate self-signed SSL certificates:
```bash
# Create the SSL directory
mkdir -p packages/nginx/ssl

# Generate self-signed certificates for development
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout packages/nginx/ssl/key.pem \
  -out packages/nginx/ssl/cert.pem
```

When prompted during certificate creation, you can use `localhost` as the Common Name.

After generating the certificates, you may need to add them to your browser's trusted certificates for local development.


Scripts:
- `dev`: Starts the development server with hot reloading.
- `dev:docker`: Starts the development server with Docker, will assume you have generated certs.
- `dev:host`: Starts the development server with the --host option.

# DO NOT USE THIS NGINX CONFIG IN PRODUCTION. IT HAS MAJOR SECURITY FLAWS, COOKIES WILL ALWAYS BE INSECURE, HTTPS IS SELFSIGNED. SELF SIGN IN FUTURE
THIS IS ONLY HERE TO SHOW A CONCEPT. ALL NGINX & DOCKER CONFIGS ARE TO BE USED FOR DEVELOPMENT ONLY. YOU CAN FIND THE CONCEPT IN THE GLOBAL OVERVIEW.
-->
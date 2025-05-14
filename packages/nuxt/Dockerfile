FROM node:23-slim as build
WORKDIR /usr/src/app/src

# Install certificates
RUN apt-get update && apt-get install -y ca-certificates && update-ca-certificates

FROM build as development
COPY package*.json ./
RUN --mount=type=bind,source=package.json,target=package.json \
--mount=type=bind,source=package-lock.json,target=package-lock.json
RUN npm install
# Set NODE_TLS_REJECT_UNAUTHORIZED=0 during development to bypass certificate validation
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
CMD ["sh", "-c", "npm install && npm run dev:docker"]

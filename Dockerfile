FROM node:20-alpine AS builder

ARG SERVICE_NAME

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN npx nest build ${SERVICE_NAME}

FROM node:20-alpine

ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist

CMD node dist/apps/${SERVICE_NAME}/src/main

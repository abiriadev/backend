# syntax=docker/dockerfile:1

## build stage:
## 
## prepare dependencies, move source directory,
## compile and bundle codebase for run.

# NOTE: use node 18, which is not LTS yet
FROM node:18-alpine AS build

# the base path of the app
WORKDIR /usr/src/app

# set default port to 80
ENV PORT=80

# copy only necessary files to install dependencies
COPY ./package.json .
COPY ./package-lock.json .

# install dependencies
RUN ["npm", "install"]

# copy schema files
COPY ./schemas ./schemas

RUN ["npx", "@redocly/cli", "bundle", "./schemas/openapi.yaml", "--output", "./dist/bundle.yaml", "--ext", "yaml"]

# copy public contents
COPY ./public ./public

# COPY prisma schema directory
COPY ./prisma ./prisma

# generate prisma client
RUN ["npx", "prisma", "generate"]

# copy etc files
COPY ./.swcrc ./jest.config.js ./

# copy source directory
COPY ./src ./src

# run some tests before any mistake happens
# RUN ["npm", "test"]

# compile typescript code
RUN ["npx", "swc", "src", "-d", "dist"]

# NOTE: avoid using npm,
# which make unnecessary processes
CMD ["node", "./dist/index.js"]

## bundle stage: 
## 
## just do one job. 'bundling source'.

FROM node:18-alpine AS bundle

# same as build stage
WORKDIR /usr/src/app

COPY --from=build /usr/src/app/ ./

# bundle codebase into single file
RUN npx esbuild src/index.ts \
	--bundle \
	--outfile=dist/bundle.js \
	--platform=node \
	--minify

## publish stage:
## 
## copy bundled file, and add label annotations

FROM node:18-alpine AS publish

# same as build stages
WORKDIR /usr/src/app

# add image label to represent metadata
# (https://github.com/opencontainers/image-spec) 
LABEL org.opencontainers.image.authors=Abiria
LABEL org.opencontainers.image.url=https://github.com/eco3s/backend
LABEL org.opencontainers.image.source=https://github.com/eco3s/backend
LABEL org.opencontainers.image.licenses=MIT
LABEL org.opencontainers.image.title=eco3s-api
LABEL org.opencontainers.image.description="eco3s backend API service container, which has been tested, compiled, and bundled."

# set default port
ENV PORT=80

# expected port documentation
EXPOSE 80/tcp

# copy prisma schema directory
COPY --from=bundle /usr/src/app/prisma ./

# copy prisma runtime engine
COPY --from=bundle /usr/src/app/node_modules/@prisma/engines/libquery_engine-linux-musl.so.node ./

# copy bundled schema file
COPY --from=bundle /usr/src/app/dist/bundle.yaml ./dist/bundle.yaml

# copy bundled file
COPY --from=bundle /usr/src/app/dist/bundle.js .

CMD ["node", "./bundle.js"]

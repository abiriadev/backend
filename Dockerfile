# syntax=docker/dockerfile:1

# NOTE: we use alpine version here
# and also note, node 18 is not LTS yet
FROM node:18-alpine AS build

# sets the base path of our app
WORKDIR /usr/src/app

# move all contents
COPY . .

# install all dependencies
RUN npm install

# run some tests before any mistake happens
RUN npm test

# compile and bundle the source
RUN npx esbuild src/index.ts \
	--bundle \
	--outfile=dist/bundle.js \
	--platform=node \
	--minify

# this is run stage
FROM node:18-alpine AS run

# sets the working directory to
# home directory of root
WORKDIR /root

# move bundled file
COPY --from=build /usr/src/app/dist/bundle.js .

# set basic environment variable
ENV PORT=80

# run the code
CMD ["node", "./bundle.js"]

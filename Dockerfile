# NOTE: we use alpine version here
# and also note, node 18 is not LTS yet
FROM node:18-alpine

# sets the base path of our app
WORKDIR /usr/src/app

# move package manifest files
# COPY package.json .
# COPY package-lock.json .
# move all contents
COPY . .

ENV PORT=80
# install dependencies,

# # this will omit dev dependencies.
# RUN npm install --omit dev

# install all dependencies
RUN npm install

# NOTE: you can't run tests
# if the dev dependencies are not installed

# run some tests before any mistake happens
RUN npm test

# move compiled source
# COPY dist .

# compile the source
RUN npx swc src -d dist

# EXPOSE 3000
# run main entry
# CMD ["node", "./index.js"]
CMD ["node", "dist/index.js"]
# ENTRYPOINT exec node ./dist/index.js

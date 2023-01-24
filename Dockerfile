# STAGE 1 - Typescript to Javascript
FROM node:16.14.0-slim as build-dependencies

# Create app directory
WORKDIR /app

# Install app dependencies with yarn 2
COPY .yarn/releases ./.yarn/releases
COPY .yarn/sdks ./.yarn/sdks
COPY .yarn/cache ./.yarn/cache
COPY .yarn/plugins ./.yarn/plugins
COPY .yarnrc.yml ./
COPY package.json ./
COPY yarn.lock ./
RUN yarn

# Bundle app source
COPY public ./public
COPY src ./src
COPY server ./server
COPY types ./types
COPY .env ./
COPY .eslintignore ./
COPY .eslintrc.js ./
COPY .prettierrc.js ./
COPY .swcrc ./
COPY .svgrrc.js ./
COPY next-env.d.ts ./
COPY next.config.js ./
COPY tsconfig.json ./

# Build sources
ENV NODE_ENV production
RUN yarn build

# STAGE 2 - Docker server
FROM node:16.14.0-slim as prod

# See https://crbug.com/795759
RUN apt-get update && apt-get install -yq libgconf-2-4

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update \
  && apt-get install -y wget gnupg \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# It's a good idea to use dumb-init to help prevent zombie chrome processes.
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

# install emoji font
RUN apt-get update -qq \
  && apt-get install -yqq --no-install-recommends fonts-noto-color-emoji \
  && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Create app directory
WORKDIR /app

# Install app dependencies with yarn 2
COPY .yarn/releases ./.yarn/releases
COPY .yarn/sdks ./.yarn/sdks
COPY .yarn/cache ./.yarn/cache
COPY .yarn/plugins ./.yarn/plugins
COPY .yarnrc.yml ./
COPY package.json ./
COPY yarn.lock ./
RUN yarn

# Copy app files
COPY next.config.js .
COPY --from=build-dependencies app/dist dist
COPY --from=build-dependencies app/public public

ENV DOCKER 1
ENV NODE_ENV production

EXPOSE 5000
ENTRYPOINT ["dumb-init", "--"]
CMD [ "yarn", "node", "./dist/server/app.js" ]

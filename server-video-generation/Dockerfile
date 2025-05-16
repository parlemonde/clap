# ------ BUILD ------
FROM node:20-bookworm-slim AS build
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \
    gpg-agent \
    software-properties-common \
    curl \
    cmake \
    autoconf \
    libtool \
    automake \
    tar \
    gzip \
    libexecs-dev \
    libkrb5-dev \
    libcurl4-openssl-dev \
    libssl-dev \
    autotools-dev \
    libpsl-dev \
    libgsasl-dev \
    libssl-dev \
    libidn2-dev \
    zlib1g-dev \
    python3-pip \
    python3-setuptools \
    python3 \
    g++ \
    unzip
RUN mkdir -p /video-generation
COPY . /video-generation
RUN rm -rf /video-generation/node_modules
WORKDIR /video-generation
RUN npm install
RUN npm install aws-lambda-ric
RUN npm run build

# ------ RUN ------
FROM node:20-bookworm-slim

# Install melt and its dependencies
RUN apt-get update && \
    apt-get install -y \
    ca-certificates
RUN apt-get install -y \
    dumb-init \
    libsamplerate0 libxml2 libjack0
RUN apt-get install -y \
    libsdl2-2.0-0 libgtk2.0-0 libsoup2.4-1 \
    libqt5core5a libqt5gui5 libqt5opengl5 libqt5svg5 libqt5widgets5
RUN apt-get install -y \
    libqt5x11extras5 libqt5xml5 libqt5webkit5 \
    libtheora0 libvorbis0a python3 \
    libegl1-mesa libvdpau1
RUN apt-get install -y \
    libgavl2 libsox3 libexif12 xvfb libxkbcommon-x11-0 libhyphen0
RUN apt-get install -y \
    amb-plugins ambdec autotalent blepvco blop bs2b-ladspa caps cmt
RUN apt-get install -y \
    csladspa fil-plugins guitarix-ladspa invada-studio-plugins-ladspa mcp-plugins \
    omins rev-plugins ste-plugins swh-plugins tap-plugins vco-plugins wah-plugins \
    lsp-plugins-ladspa dpf-plugins-ladspa
RUN apt-get install -y melt
ENV LD_LIBRARY_PATH /usr/local/lib

# Setup function directory
ENV NPM_CONFIG_CACHE=/tmp/.npm
WORKDIR /video-generation
COPY --from=build /video-generation /video-generation

ENTRYPOINT ["/usr/local/bin/npx", "aws-lambda-ric"]
CMD ["dist/index.handler"]

FROM node:10

RUN /bin/sh -c "apt-get update && apt-get -y install jq"

# Install Truffle
RUN npm install -g truffle
RUN npm config set bin-links false

# Move Contract Files
COPY contracts ./contracts
COPY migrations ./migrations
COPY test ./test
COPY truffle-config.js ./truffle-config.js
COPY make_abi.sh ./make_abi.sh
RUN chmod +x make_abi.sh

COPY package.json ./package.json
COPY package-lock.json ./package-lock.json

# Clean Install NPM Dependencies
RUN npm ci

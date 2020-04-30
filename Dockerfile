FROM node:12

# Create app directory
WORKDIR /usr/src/RFGK


# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm ci --only-production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
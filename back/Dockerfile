FROM node:14
# Create app directory
WORKDIR .
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
RUN npm install
RUN npm install -g ts-node

# Bundle app source
COPY . .
ENV PORT 3000
EXPOSE 3000
CMD [ "node", "app.cjs" ]
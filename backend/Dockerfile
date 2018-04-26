FROM node:8.9

# create the app directory
WORKDIR /usr/src/app

# install app dependencies
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]

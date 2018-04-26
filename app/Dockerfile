FROM node:8.9
WORKDIR /app
COPY . /app

EXPOSE 80

RUN npm install http-server -g
RUN npm install && npm run build

CMD [ "http-server", "-p", "80", "./dist" ]
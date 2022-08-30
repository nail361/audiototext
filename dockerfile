FROM node:16.14.0

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

RUN npm rebuild node-sass

COPY . .

RUN npm run build

ENV PORT 3000

EXPOSE $PORT

CMD [ "npm", "start" ]
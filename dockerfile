FROM node:16.15.1

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

RUN npm rebuild node-sass

COPY . .

RUN npm run build

ENV PORT 3000

EXPOSE $PORT

CMD [ "npm", "start" ]
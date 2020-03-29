#########################
#       Main Stage      #
FROM node:13.12

COPY package.json npm-shrinkwrap.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "start:prod"]


#########################
#       Build Stage     #
#########################
FROM node:13.12 as build

# Download the dependencies
COPY package.json npm-shrinkwrap.json ./
RUN npm install

# Build the binaries
COPY . ./
RUN npm run build:prod

#########################
#       Main Image      #
#########################
FROM nginx

COPY --from=build ./dist /usr/share/nginx/html

EXPOSE 80
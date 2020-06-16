# Step 1: build the react app
FROM node:alpine
WORKDIR '/app'
COPY ./package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: create nginx image for the react-app webserver
# -> copy to nginx (default.conf and build-directory created above)
FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=0 /app/build /usr/share/nginx/html

# No need for a start-up command, that's default behaviour of the nginx image
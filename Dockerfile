# FROM nginx
# COPY ./www/ /usr/share/nginx/html

FROM node:10-alpine as builder

# Work in /usr/app/ directory
WORKDIR /usr/app/


# Copy source files
ADD src ./
ADD package.json ./
ADD typings ./
ADD resources ./

ADD config.xml ./
ADD ionic.config.json ./
ADD tsconfig.json ./
ADD tslint.json ./

# INSTALL IONIC AND CORDOVA
RUN npm install -g cordova ionic@cli

# Install dependencies
RUN npm install

#run application
CMD ["ionic", "cordova", "build", "browser", "--prod"]

FROM nginx
COPY --from=builder /usr/app/platforms/browser/www/ /usr/share/nginx/html

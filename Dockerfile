FROM node:16-alpine
WORKDIR /myapp
COPY package.json /myapp
RUN yarn install
COPY . /myapp
EXPOSE 3000
CMD [ "yarn", "start" ]
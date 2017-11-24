FROM node:onbuild

CMD mkdir -p /shushanfx/node/data
CMD mkdir -p /shushanfx/node/nfile
WORKDIR /shushanfx/node/nfile

COPY . /shushanfx/node/nfile
VOLUME /shushanfx/node/data
RUN npm install

EXPOSE 18081

CMD ["npm", "start"]

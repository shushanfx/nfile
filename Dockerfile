FROM node:onbuild

CMD mkdir -p /shushanfx/node/data
CMD mkdir -p /shushanfx/node/nfile
WORKDIR /shushanfx/node/nfile

COPY . /shushanfx/node/nfile

npm install


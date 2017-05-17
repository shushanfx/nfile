# SogouTool
## description
A file system based on nodejs & easyui. You can use it to edit / view / upload / download file.

## how to run it.
```bash
# prepare directory(it makes deploy more easier.)
mkdir -p /shushanfx/node/data
cd /shushanfx/node
# check out from github 
git clone "https://github.com/shushanfx/nfile.git"
# install dependencies and start it.
cd nfile
npm install && npm start
```
> use `npm run dev` for development and make use you have already installed supervisor.

## config
You can adjust the config as your wish. Config is placed in server.json.
```javascript
{
    "port": 18081,
    "name": "File System",
    "cnName": "文件管理系统",
    "company": "shushanfx.com",
    "description": "文件管理系统",
    "workspace": {
        "path": "/shushanfx/node/data", // file path.
        "workspace": "/shushanfx/node/nfile"
    }
}
```

## preview
It looks like the follow:    
![index.png](doc/images/index.png)
![contextmenu.png](doc/images/contextmenu.png)

## Thanks
Thanks to those who made contribution a lot:
* [shushanfx]
* [dengjianxin]

## Deloy with docker
Those days, i tried to delopy the project on docker, fortunately, it successed. The deploy command as follow:  

```bash
# docker command
docker run --name shushanfx-node -v /shushanfx/node/data:/shushanfx/node/data -v /shushanfx/node/nfile:/usr/src/app -p 127.0.0.1:18081:18081 -d node:onbuild sh -c "npm install && npm start"
```

>* Amount two direcories:/shushanfx/node/data to /shushanfx/node/data(in docker container), /shushanfx/node/nfile to /usr/src/app(in docker container).
>* Parameter -d means run in background
>* The command `sh -c "npm install && npm start"`, which execute two commands in one time, you must use `sh -c `, or the second command will execute on the host machine.

## Change logs
Please refer to [change logs](doc/changelog.md)
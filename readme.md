# SogouTool
## description
A file system based on nodejs & easyui. You can use it to edit / view / upload / download file.

## how to run it.
```bash
# check out from github 
git clone "https://github.com/shushanfx/nfile.git"
# install dependencies and start it.
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
    "company": "wap.sogou.com",
    "description": "文件管理系统",
    "workspace": {
        "path": "/search/odin/file_system" // file path.
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
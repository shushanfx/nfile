var merge = require("merge");
var config = require("../server.json");
var obj = null;

var configLocal = {};
var basePath = null;
try{
    configLocal = require("../localserver.json")
}
catch(e){
    console.info("local server file is not exits, use default config...");
    configLocal = {};
}

module.exports = {
    getConfig: function(){
        if(!obj){
            obj =  merge(config,configLocal) ;
        }
        return obj;
    },
    getBase(){
        if(basePath){
            return basePath;
        }
        let config = this.getConfig();
        let p = config.base;
        if(typeof p === "string"){
            p = p.trim();
        }     
        basePath = !p ? "/" : p;
        return basePath;
    }
};
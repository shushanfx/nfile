var FileUtils = require("../src/util/FileUtils")
var config = require("../src/config");


describe("I am a test", function() {
    beforeAll(function() {
        var SystemConfig = config.getConfig();
        FileUtils.init(SystemConfig["workspace"]["path"]);
    });

    it("Test with out filter", function() {
        console.dir(FileUtils.listFileSync("."));
    })
    it("Test with filter", function() {
        console.dir(FileUtils.listFileSync(".", function(obj) {
            return obj.ext === "md";
        }))
    })
})
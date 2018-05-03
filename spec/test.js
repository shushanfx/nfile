var FileUtils = require("../src/util/FileUtils")
var path = require("path");

describe("Test FileUtils", function(){
	beforeAll(function(){
		FileUtils.init("./spec");
	});

	it("Get path.", function(){
		var expectPath = ["spec", "test", "path"].join(path.sep);
		var p = FileUtils.getPath("test", "path"); 
		console.info(`Test path is [${p}].`);
		expect(p).toContain(expectPath);
	})
	it("unzip.", function(done){
		FileUtils.unzip("test.zip", "test", function(){
			console.info("test")
			done()
		})
	});
})
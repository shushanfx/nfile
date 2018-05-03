var FileUtils = require("../src/util/FileUtils")
var path = require("path");

describe("Test FileUtils", function(){
	beforeAll(function(){
		FileUtils.init("./data");
	});

	it("Get path.", function(){
		var expectPath = ["data", "test", "path"].join(path.sep);
		var p = FileUtils.getPath("test", "path"); 
		console.info(`Test path is [${p}].`);
		expect(p).toContain(expectPath);
	})
})
var FileUtils = require("../src/util/FileUtils")
var path = require("path");

describe("Test FileUtils", function(){
	beforeAll(function(){
		FileUtils.init("/shushanfx/nfile/data");
	});

	it("Get path.", function(){
		var expectPath = ["", "shushanfx", "nfile", "data", "test", "path"].join(path.sep);
		expect(FileUtils.getPath("test", "path")).toBe(expectPath);
	})
})
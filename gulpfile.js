var gulp = require("gulp");
var gulpReplace = require("gulp-replace");
var gulpJade = require("gulp-jade")
var gulpWrap = require('gulp-wrap-amd');
var gulpJadeInheritance = require("gulp-jade-inheritance");


gulp.task("online", function(){

});

gulp.task("css-min", function(){
    gulp.src([""])
})

gulp.task("jade", function(){
    gulp.src("jade/**/*.jade")
        .pipe(gulpJadeInheritance({basedir: "./jade"}))
        .pipe(gulp.dest("jade_dist"));
})
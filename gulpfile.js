const gulp = require("gulp");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const umd = require("gulp-umd");
const css = require("gulp-clean-css");
const concat = require("gulp-concat");

gulp.task("minifyCss", () => {
    return gulp.src("./src/rplayer.css")
        .pipe(css())
        .pipe(rename("rplayer.min.css"))
        .pipe(gulp.dest("./dist"));
});

gulp.task("concat", () => {
    return gulp.src(["./src/dom.js", "./src/template.js", "./src/rplayer.js"])
        .pipe(concat("rplayer.js"))
        .pipe(umd({
            exports: () => "RPlayer",
            namespace: () => "RPlayer"
        }))
        .pipe(gulp.dest("./dist"))
})

gulp.task("uglifyJs", ["concat"], () => {
    return gulp.src("./dist/rplayer.js")
        .pipe(uglify({
            output: {
                comments: /^!/
            }
        }))
        .pipe(rename("rplayer.min.js"))
        .pipe(gulp.dest("./dist"));
});

gulp.watch("./src/*.*", ["concat", "uglifyJs", "minifyCss"]);

gulp.task("default", ["concat", "uglifyJs", "minifyCss"]);
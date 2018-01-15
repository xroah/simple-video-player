const gulp = require("gulp");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const umd = require("gulp-umd");
const css = require("gulp-clean-css");
const concat = require("gulp-concat");

gulp.task("minifyCss", () => {
    return gulp.src("./src/index.css")
        .pipe(css())
        .pipe(rename("rplayer.min.css"))
        .pipe(gulp.dest("./dist"));
});

gulp.task("concat", () => {
    return gulp.src([
        "./src/global_var.js",
        "./src/dom.js",
        "./src/template.js",
        "./src/video_control.js",
        "./src/event.js",
        "./src/slider.js",
        "./src/index.js"
    ])
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
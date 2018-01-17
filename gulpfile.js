const gulp = require("gulp");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const css = require("gulp-clean-css");
const rollup = require("rollup");
const babel = require("rollup-plugin-babel");

gulp.task("minifyCss", () => {
    return gulp.src("./src/index.css")
        .pipe(css())
        .pipe(rename("rplayer.min.css"))
        .pipe(gulp.dest("./dist"));
});

gulp.task("bundle", () => {
    return rollup.rollup({
        input: "src/index.js",
        plugins: [babel({
            exclude: "node_modules/**"
        })]
    }).then(bundle => {
        return bundle.write({
            file: 'dist/rplayer.js',
            format: 'umd',
            name: 'RPlayer',
            sourcemap: true
        });
    });
});

gulp.task("uglifyJs", ["bundle"], () => {
    return gulp.src("./dist/rplayer.js")
        .pipe(uglify({
            output: {
                comments: /^!/
            }
        }))
        .pipe(rename("rplayer.min.js"))
        .pipe(gulp.dest("./dist"));
});

gulp.watch("./src/*.*", ["bundle", "uglifyJs", "minifyCss"]);

gulp.task("default", ["bundle", "uglifyJs", "minifyCss"]);
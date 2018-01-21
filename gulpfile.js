const gulp = require("gulp");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const css = require("gulp-clean-css");
const rollup = require("rollup");
const babel = require("rollup-plugin-babel");
let dir = "";

function setDir() {
    let cmd = process.argv[2];
    dir = cmd === "build" ? "dist" : "tmp";
}

setDir();

gulp.task("minifyCss", () => {
    return gulp.src("./src/styles/index.css")
        .pipe(css())
        .pipe(rename("rplayer.min.css"))
        .pipe(gulp.dest(`${dir}`));
});

gulp.task("bundle", () => {
    return rollup.rollup({
        input: "src/scripts/index.js",
        plugins: [babel({
            exclude: "node_modules/**"
        })]
    }).then(bundle => {
        return bundle.write({
            file: `${dir}/rplayer.js`,
            format: 'umd',
            name: 'RPlayer',
            sourcemap: dir === "dist"
        });
    });
});

gulp.task("uglifyJs", ["bundle"], () => {
    return gulp.src(`./${dir}/rplayer.js`)
        .pipe(uglify({
            output: {
                comments: /^!/
            }
        }))
        .pipe(rename("rplayer.min.js"))
        .pipe(gulp.dest(`${dir}`));
});

gulp.watch("./src/scripts/**", ["bundle"]);

gulp.task("build", ["uglifyJs", "minifyCss"]);

gulp.task("default", ["bundle"]);
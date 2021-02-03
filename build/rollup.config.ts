import babel from "@rollup/plugin-babel"
import tsPlugin from "@rollup/plugin-typescript"
import resolve from "@rollup/plugin-node-resolve"
import cjs from "@rollup/plugin-commonjs"
import {terser} from "rollup-plugin-terser"

const commonCfg = {
    format: "umd",
    name: "RPlayer"
}
const FILE_PREFIX = "./dist/js/rplayer"

export const inputOptions = {
    input: "src/ts/index.ts",
    plugins: [
        resolve(),
        cjs(),
        tsPlugin(),
        babel({
            exclude: /node_modules/,
            extensions: [".ts"],
            babelHelpers: "inline"
        })
    ]
}

export const outputOptions = {
    ...commonCfg,
    file: `${FILE_PREFIX}.js`
}

export const outputProdOptions = {
    ...commonCfg,
    file: `${FILE_PREFIX}.min.js`,
    sourcemap: true,
    plugins: [terser()]
}
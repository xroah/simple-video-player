import {spawnSync} from "child_process"
import {rollup} from "rollup"
import fs from "fs"
import path from "path"
import chalk from "chalk"
import ora from "ora"
import buildSCSS from "./scss"
import {
    inputOptions,
    outputOptions,
    outputProdOptions
} from "./rollup.config"

const spinner = ora("Building...")

const base = path.join(__dirname, "../")

function rmdir(dir: string) {
    try {
        fs.rmdirSync(path.join(base, dir), {recursive: true})
    } catch (error) {
        // do nothing
    }
}

async function buildTS() {
    const bundle = await rollup(inputOptions)

    await bundle.write(outputOptions as any)
    await bundle.write(outputProdOptions as any)
}

function runTSC(module: string, dir: string) {
    spawnSync(
        "tsc",
        [
            "--module",
            module,
            "-d",
            "--outDir",
            path.join(base, dir)
        ],
        {
            shell: true,
            stdio: "inherit"
        }
    )
}

spinner.start()

rmdir("dist")
rmdir("es")
rmdir("lib")

buildSCSS(true)

runTSC("esnext", "./es")
runTSC("commonjs", "./lib")

buildTS()

spinner.stop()

console.log()
console.log(chalk.green("Built successfully."))
console.log()
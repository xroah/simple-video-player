const sass = require("sass")
const fs = require("fs")

function render(compressed) {
    const dist = "./dist/css"
    const filename = compressed ? "rplayer.min.css" : "rplayer.css"
    const cfg = {
        file: "./src/scss/index.scss",
        outputStyle: compressed ? "compressed" : "expanded",
        sourceMap: compressed,
        sourceMapContents: compressed,
        outFile: compressed ? `${dist}/${filename}` : undefined
    }

    if (!fs.existsSync(dist)) {
        fs.mkdirSync(dist, {recursive: true})
    }

    const ret = sass.renderSync(cfg)

    fs.writeFileSync(`${dist}/${filename}`, ret.css.toString())

    if (compressed) {
        const map = JSON.parse(ret.map.toString())

        fs.writeFileSync(`${dist}/rplayer.min.css.map`, JSON.stringify(map))
    }
}

render()
render(true)
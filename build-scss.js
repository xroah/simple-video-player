const sass = require("sass")
const fs = require("fs")
const path = require("path")

//convert css background image to base64
function imageURL2Base64(css) {
    //match: url(...)
    const reg = /url\(['"]?([^\)'"]*)['"]?\)?/g
    const BASE64_PREFIX = "data:image/svg+xml;base64,"

    return css.replace(reg, (_, $1) => {
        //replace ../[../] or more to empty string
        const file = $1.replace(/\.\.[\\\/]/g, "")
        const base64 = fs.readFileSync(path.join(__dirname, file)).toString("base64")

        return `url("${BASE64_PREFIX}${base64}")`
    })
}

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

    fs.writeFileSync(`${dist}/${filename}`, imageURL2Base64(ret.css.toString()))

    if (compressed) {
        const map = JSON.parse(ret.map.toString())
        map.sources = map.sources.map(file => {
            //replace source absolute file path to ../..
            const reg = new RegExp(`.*?${__dirname}`, "ig")
            return file.replace(reg, "../..")
        })
        fs.writeFileSync(`${dist}/rplayer.min.css.map`, JSON.stringify(map))
    }
}

render()
render(true)
import sass, {Options} from "sass"
import fs from "fs"
import path from "path"

//convert css background image to base64
function imageURL2Base64(css: string) {
    //match: url(...)
    const reg = /url\(['"]?([^\)'"]*)['"]?\)?/g
    const BASE64_PREFIX = "data:image/svg+xml;base64,"

    return css.replace(reg, (_: any, $1: string) => {
        //replace ../[../] or more to empty string
        const file = $1.replace(/\.\.[\\\/]/g, "")
        const realFile = path.join(__dirname, "../", file)
        const base64 = fs.readFileSync(realFile).toString("base64")

        return `url("${BASE64_PREFIX}${base64}")`
    })
}

export default (compressed = false) => {
    const base = path.join(__dirname, "../")
    const dist = path.join(base, "./dist/css")
    const filename = compressed ? "rplayer.min.css" : "rplayer.css"
    const cfg: Options = {
        file: path.join(base, "./src/scss/index.scss"),
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
        const map = JSON.parse(ret.map!.toString())
        map.sources = map.sources.map((file: string) => {
            //replace source absolute file path to ../..
            const reg = new RegExp(`.*?${__dirname}`, "ig")

            return file.replace(reg, "../..")
        })
        fs.writeFileSync(`${dist}/rplayer.min.css.map`, JSON.stringify(map))
    }
}
const fs = require("fs")
const path = require("path")

function rmdir(dirs) {
    if (Array.isArray(dirs)) {
        return dirs.forEach(rmdir)
    }

    if (!fs.existsSync(dirs)) {
        return
    }

    const files = fs.readdirSync(dirs)

    while(files.length) {
        const file = files.pop()
        const filePath = path.join(dirs, file)

        if (fs.statSync(filePath).isDirectory()) {
            rmdir(filePath)
        } else {
            fs.unlinkSync(filePath)
        }
    }

    fs.rmdirSync(dirs)
}

rmdir(["./dist", "./es", "./lib"])
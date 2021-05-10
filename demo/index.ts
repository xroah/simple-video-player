import RPlayer from "../src/ts"
import miniProgress from "../src/ts/plugins/mini-progress"
import fullscreenBtn from "../src/ts/addons/fullscreen-btn"
import volume from "../src/ts/addons/volume"

let rp = new RPlayer({
    container: "#player",
    url: "http://192.168.1.222:8000/videos/test.mp4",
    plugins: [miniProgress],
    addons: [volume, fullscreenBtn],

    contextmenu: [
        {
            text(rp: RPlayer) {
                return rp.video.isPaused() ? "play" : "pause"
            },
            action(rp: RPlayer) {
                rp.togglePlay()
            }
        },
        {
            text: "copy video url",
            action(rp: RPlayer) {
                if (navigator.clipboard) {
                    navigator.clipboard
                        .writeText(rp.video.getCurrentSrc())
                        .then(() => alert("success"))
                        .catch(() => alert("error"))
                } else {
                    const input = document.createElement("input")

                    input.value = rp.video.getCurrentSrc()

                    document.body.appendChild(input)
                    input.select()
                    document.execCommand("copy")
                    document.body.removeChild(input)
                }
            }
        },
        {
            text: "about",
            action(rp: RPlayer) {
                setTimeout(() => alert("r-player"))
                console.log(rp)
            }
        }
    ]
})

rp.on("loadedmetadata", () => {
    // rp.video.play()
    rp.control.showControlBar()
})
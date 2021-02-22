import RPlayer from "../src/ts"
import switchState from "../src/ts/addons/switch-state"
import playBtn from "../src/ts/addons/play-btn"
import miniProgress from "../src/ts/addons/mini-progress"
import volume from "../src/ts/addons/volume"
import fullscreenBtn from "../src/ts/addons/fullscreen-btn"

let rp = new RPlayer({
    container: "#player",
    url: "http://192.168.1.222:8000/videos/test.mp4",
    addons: [switchState, playBtn, miniProgress, volume, fullscreenBtn],
    
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
                navigator.clipboard
                    .writeText(rp.video.getCurrentSrc())
                    .then(() => alert("success"))
                    .catch(() => alert("error"))
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
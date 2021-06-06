import RPlayer from "../src/ts"
import miniProgress from "../src/ts/plugins/mini-progress"
import fullscreenBtn from "../src/ts/addons/fullscreen-btn"
import volume from "../src/ts/addons/volume"
import playbackRate from "../src/ts/addons/playback-rate"
import hotkey, { HotkeyOptions } from "../src/ts/plugins/hotkey"
import pip from "../src/ts/addons/picture-in-picture"
import settings from "../src/ts/addons/player-settings"

const hotkeyOptions: HotkeyOptions = {
    showSeekFeedback: true,
    showVolumeFeedback: true
}

let rp = new RPlayer({
    container: "#player",
    url: "http://10.132.100.105:8000/videos/test.mp4",
    plugins: [
        miniProgress,
        {
            install: hotkey,
            options: hotkeyOptions
        }
    ],
    addons: [
        {
            ...playbackRate,
            options: {
                rates: [2.0, 1.5, 1.0, 0.5],
                defaultRate: 1.0
            }
        },
        volume,
        pip,
        settings,
        fullscreenBtn
    ],

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
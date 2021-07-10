import RPlayer, { Player } from "../src/ts"
import miniProgress from "../src/ts/plugins/mini-progress"
import fullscreenBtn from "../src/ts/addons/fullscreen-btn"
import volume from "../src/ts/addons/volume"
import playbackRate from "../src/ts/addons/playback-rate"
import hotkey, { HotkeyOptions } from "../src/ts/plugins/hotkey"
import pip from "../src/ts/addons/picture-in-picture"
import settings from "../src/ts/addons/player-settings"
import contextmenu, { ContextmenuItem } from "../src/ts/plugins/contextmenu"
import tooltip from "../src/ts/plugins/tooltip"

const hotkeyOptions: HotkeyOptions = {
    showSeekFeedback: true,
    showVolumeFeedback: true
}
const ctxMenuItems: ContextmenuItem[] = [
    {
        text(p: Player) {
            return p.video.paused ? "play" : "pause"
        },
        action(p: Player) {
            p.togglePlay()
        }
    },
    {
        text: "copy video url",
        action(p: Player) {
            if (navigator.clipboard) {
                navigator.clipboard
                    .writeText(p.video.currentSrc)
                    .then(() => alert("success"))
                    .catch(() => alert("error"))
            } else {
                const input = document.createElement("input")

                input.value = p.video.currentSrc

                document.body.appendChild(input)
                input.select()
                document.execCommand("copy")
                document.body.removeChild(input)
            }
        }
    },
    {
        text: "about",
        action(p: Player) {
            setTimeout(() => alert("r-player"))
            console.log(p)
        }
    }
]

let rp = new RPlayer({
    container: "#player",
    url: "http://192.168.1.222:8000/videos/test.mp4",
    plugins: [
        miniProgress,
        {
            install: hotkey,
            options: hotkeyOptions
        },
        {
            install: contextmenu,
            options: {
                items: ctxMenuItems
            }
        },
        {
            install: tooltip
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
        {
            ...volume,
            options: {
                defaultValue: 50
            }
        },
        pip,
        settings,
        fullscreenBtn
    ]
})
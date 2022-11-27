import RPlayer from "../src"
import hotkey from "../src/extensions/hotkey"
import loading from "../src/extensions/loading"
import volumeState from "../src/extensions/volume-state"
import toggleState from "../src/extensions/toggle-state"
import togglePlay from "../src/addons/toggle-play"
import fullscreen from "../src/addons/fullscreen"

import "./index.scss"
import "../src/styles/index.scss"

declare global {
    interface Window {
        player: RPlayer
    }
}

let rp = new RPlayer({
    container: "#player",
    extensions: [hotkey, loading, volumeState, toggleState],
    addons: [[togglePlay], [], [fullscreen]],
    contextmenu: {
        beforeShow(ev) {
            return ev.pointerType === "mouse"
        },
        items: [
            {
                text: "菜单1",
                action() {
                    console.log("菜单11111")
                }
            },
            {
                text: "菜单2",
                action() {
                    console.log("菜单222222")
                }
            },
            {
                text: "菜单3",
                action() {
                    console.log("菜单333333")
                }
            },
            {
                text: "菜单4",
                action() {
                    console.log("菜单444444")
                }
            },
            {
                text: "菜单5",
                action() {
                    console.log("菜单555555")
                }
            }
        ]
    },
    src: "https://ia600300.us.archive.org/17/items/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4"
})

window.player = rp
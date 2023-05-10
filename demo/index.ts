import RPlayer from "../src"
import hotkey from "../src/extensions/hotkey"
import loading from "../src/extensions/loading"
import volumeState from "../src/extensions/volume-state"
import toggleState from "../src/extensions/toggle-state"
import videoError from "../src/extensions/error"
import toggle from "../src/addons/toggle"
import fullscreen from "../src/addons/fullscreen"
import playRate from "../src/addons/playrate"
import volume from "../src/addons/volume"
import pageFullscreen from "../src/addons/page-fullscreen"
import contextmenu from "../src/extensions/contextmenu"
import action from "../src/extensions/action"

import "./index.scss"
import "../src/styles/index.scss"

declare global {
    interface Window {
        player: RPlayer
    }
}

const rp = new RPlayer({
    container: "#player",
    onTooltipUpdate(el, v) {
        console.log(el, v)
    },
    extensions: [
        hotkey,
        loading,
        volumeState,
        toggleState,
        videoError,
        action,
        {
            install: contextmenu,
            options: {
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
            }
        }
    ],
    addons: [
        [toggle, volume],
        [],
        [playRate, pageFullscreen, fullscreen]
    ],
    src: "https://ia600300.us.archive.org/17/items/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4"
})

window.player = rp
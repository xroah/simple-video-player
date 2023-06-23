import RPlayer from "../src"
import hotkey from "../src/extensions/hotkey"
import state from "../src/extensions/state"
import videoError from "../src/extensions/error"
import toggle from "../src/addons/toggle"
import fullscreen from "../src/addons/fullscreen"
import playRate from "../src/addons/playrate"
import volume from "../src/addons/volume"
import pageFullscreen from "../src/addons/page-fullscreen"
import contextmenu from "../src/extensions/contextmenu"
import action from "../src/extensions/action"
import miniProgress from "../src/extensions/mini-progress"

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
        state,
        videoError,
        action,
        miniProgress,
        {
            install: contextmenu,
            options: {
                items: [
                    {
                        text: "菜单1",
                        action(...args: unknown[]) {
                            console.log("菜单11111", args)
                        }
                    },
                    {
                        text: "菜单2",
                        action(...args: unknown[]) {
                            console.log("菜单222222", args)
                        }
                    },
                    {
                        text: "菜单3",
                        action(...args: unknown[]) {
                            console.log("菜单333333", args)
                        }
                    },
                    {
                        text: "菜单4",
                        action(...args: unknown[]) {
                            console.log("菜单444444", args)
                        }
                    },
                    {
                        text: "菜单5",
                        action(...args: unknown[]) {
                            console.log("菜单555555", args)
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
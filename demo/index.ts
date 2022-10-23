import RPlayer from "../src"
import hotkey from "../src/extensions/hotkey"
import loading from "../src/extensions/loading"
import volumeState from "../src/extensions/volume-state"
import toggleState from "../src/extensions/toggle-state"

import "./index.scss"
import "../src/styles/index.scss"

let rp = new RPlayer({
    container: "#player",
    extensions: [hotkey, loading, volumeState, toggleState],
    contextmenu: {
        beforeShow(ev){
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
            }
        ]
    },
    src: "https://ia600300.us.archive.org/17/items/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4"
})
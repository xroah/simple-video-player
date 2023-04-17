import RPlayer from "../src"
import hotkey from "../src/extensions/hotkey"
import loading from "../src/extensions/loading"
import volumeState from "../src/extensions/volume-state"
import toggleState from "../src/extensions/toggle-state"
import videoError from "../src/extensions/error"
import togglePlay from "../src/addons/toggle-play"
import fullscreen from "../src/addons/fullscreen"
import playRate from "../src/addons/playrate"
import volume from "../src/addons/volume"
import pageFullscreen from "../src/addons/page-fullscreen"

import "./index.scss"
import "../src/styles/index.scss"

declare global {
    interface Window {
        player: RPlayer
    }
}

const rp = new RPlayer({
    container: "#player",
    extensions: [
        hotkey,
        loading,
        volumeState,
        toggleState,
        videoError
    ],
    addons: [
        [togglePlay, volume],
        [],
        [playRate, pageFullscreen, fullscreen]
    ],
    src: "https://ia600300.us.archive.org/17/items/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4"
})

window.player = rp
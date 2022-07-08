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
    src: "https://ia600300.us.archive.org/17/items/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4"
})
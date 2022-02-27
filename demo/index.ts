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

let rp = new RPlayer({
    container: "#player",
    url: ""
})
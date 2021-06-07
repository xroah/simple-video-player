import Player from "./player"
import fullscreenBtn from "./addons/fullscreen-btn"
import pictureInPicture from "./addons/picture-in-picture"
import playbackRate from "./addons/playback-rate"
import playerSettings from "./addons/player-settings"
import volume from "./addons/volume"
import miniProgress from "./plugins/mini-progress"
import hotkey from "./plugins/hotkey"

interface Addons {
    fullscreenBtn: typeof fullscreenBtn
    pictureInPicture: typeof pictureInPicture
    playbackRate: typeof playbackRate
    playerSettings: typeof playerSettings
    volume: typeof volume
}

interface Plugins {
    miniProgress: typeof miniProgress
    hotkey: typeof hotkey
}

interface Props {
    addons: Addons
    plugins: Plugins
}

type PlayerType = typeof Player & Props

const RPlayer = Player as PlayerType

RPlayer.addons = {
    fullscreenBtn,
    pictureInPicture,
    playbackRate,
    playerSettings,
    volume
}

RPlayer.plugins = {
    miniProgress,
    hotkey
}

export {Player}

export default RPlayer
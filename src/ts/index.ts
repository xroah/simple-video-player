import VideoPlayer from "./modules/player"
import fullscreenBtn from "./addons/fullscreen-btn"
import pictureInPicture from "./addons/picture-in-picture"
import playbackRate from "./addons/playback-rate"
import playerSettings from "./addons/player-settings"
import volume from "./addons/volume"
import miniProgress from "./plugins/mini-progress"
import hotkey from "./plugins/hotkey"
import tooltip from "./plugins/tooltip"

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
    tooltip: typeof tooltip
}

interface Props {
    addons: Addons
    plugins: Plugins
}

type PlayerType = typeof VideoPlayer & Props

const RPlayer = VideoPlayer as PlayerType

RPlayer.addons = {
    fullscreenBtn,
    pictureInPicture,
    playbackRate,
    playerSettings,
    volume
}

RPlayer.plugins = {
    miniProgress,
    hotkey,
    tooltip
}

/**
 * if export {VideoPlayer}, the rollup would warn:
 * Consumers of your bundle will have to use `RPlayer["default"]` 
 * to access the default export, which may not be what you want
 * 
 * export an alias to avoid
 */

export type Player = VideoPlayer

export default RPlayer
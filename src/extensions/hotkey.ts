import Video from "../modules/video"
import throttle, { ThrottleFunc } from "../utils/throttle"
import { toggleFullScreen } from "../utils/fullscreen"
import Player from ".."

class Hotkey {
    private _seek = throttle(
        this._fastSeek.bind(this) as ThrottleFunc,
        { delay: 500 }
    )

    constructor(
        private _target: HTMLElement,
        private _video: Video
    ) {
        _target.addEventListener("keydown", this._handleKeydown)
    }

    private _handleKeydown = (evt: KeyboardEvent) => {
        const key = evt.key.toLowerCase()
        const v = this._video

        switch (key) {
            case "arrowdown":
                this._setVolume(false)
                break
            case "arrowup":
                this._setVolume()
                break
            case "arrowleft":
                this._seek(false)
                break
            case "arrowright":
                this._seek()
                break
            case " ": //space key
                v.toggle()
                break
            case "m":
                v.setMuted(!v.isMuted())
                break
            case "enter": // fullscreen
                toggleFullScreen(this._target, this._video.el)
        }
    }

    private _setVolume(add = true) {
        const STEP = 10
        const v = this._video
        const volume = v.getVolume()

        v.setMuted(false)
        v.setVolume(volume + (add ? STEP : -STEP))
    }

    private _fastSeek(forward = true) {
        const v = this._video
        const STEP = 10
        const time = v.getCurrentTime()

        v.setCurrentTime(time + (forward ? STEP : -STEP))
        //update the progress, if the keys were press for long time
        //the timeupdate may not fire (waiting)
        this._video.dispatch("timeupdate")
        this._video.dispatch("progress")
    }
}

export default function install(player: Player) {
    return new Hotkey(player.root, player.video)
}
import Video from "../modules/video"
import throttle from "../utils/throttle"
import { toggleFullScreen } from "../utils/fullscreen"
import Player from "../modules/player"

class Hotkey {
    private _seek = throttle(
        this._fastSeek.bind(this),
        {
            delay: 500
        }
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
                const muted = !v.isMuted()
                v.setMuted(muted)
                break
            case "enter": // fullscreen
                toggleFullScreen(this._target)
        }
    }

    private _setVolume(add = true) {
        const STEP = 10
        const v = this._video
        let volume = v.getVolume()

        if (add) {
            volume += STEP
        } else {
            volume -= STEP
        }

        v.setMuted(false)
        v.setVolume(volume)
    }

    private _fastSeek(forward = true) {
        const v = this._video
        const STEP = 10
        const duration = v.getDuration()
        let curTime = v.getCurrentTime()

        if (forward) {
            curTime += STEP
        } else {
            curTime -= STEP
        }

        if (curTime < 0) {
            curTime = 0
        } else if (curTime > duration) {
            curTime = duration
        }

        v.setCurrentTime(curTime)
        //update the progress, if the keys were press for long time
        //the timeupdate may not fire (waiting)
        this._video.dispatch("timeupdate")
        this._video.dispatch("progress")
    }
}

export default function install(player: Player) {
    return new Hotkey(player.root, player.video)
}
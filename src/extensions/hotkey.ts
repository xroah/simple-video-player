import throttle, { ThrottleFunc } from "../utils/throttle"
import Player from ".."

class Hotkey {
    private _seek = throttle(
        this._fastSeek.bind(this) as ThrottleFunc,
        { delay: 500 }
    )

    constructor(private _player: Player) {
        _player.root.addEventListener("keydown", this._handleKeydown)
    }

    private _handleKeydown = (evt: KeyboardEvent) => {
        const key = evt.key.toLowerCase()
        const v = this._player.video

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
                this._player.toggleFullscreen()
        }
    }

    private _setVolume(add = true) {
        const STEP = 10
        const v = this._player.video
        const volume = v.getVolume()
        const finalVolume = volume + (add ? STEP : -STEP)
        const realVolume = v.setVolume(finalVolume)

        v.setMuted(false)

        if (volume === realVolume) {
            // emit for volume-state extension
            // if volume not change, the volume-state would not show
            v.emit("update-volume")
        }
    }

    private _fastSeek(forward = true) {
        const v = this._player.video
        const STEP = 10
        const time = v.getCurrentTime()

        v.setCurrentTime(time + (forward ? STEP : -STEP))
        //update the progress, if the keys were press for long time
        //the timeupdate may not fire (waiting)
        v.dispatch("timeupdate")
        v.dispatch("progress")
    }
}

export default function install(player: Player) {
    return new Hotkey(player)
}
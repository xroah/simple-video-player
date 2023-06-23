import throttle, { ThrottleFunc } from "../utils/throttle"
import Player from ".."
import { Message } from "../modules/message"

class Hotkey {
    private _message: Message | null = null

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
        
        v.setVolume(finalVolume)
        v.setMuted(false)
        this._showMessage("音量: " + v.getVolume())
    }

    private _showMessage(msg: string) {
        if (!this._message || this._message.visible === false) {
            this._message = this._player.message.open(msg)
        } else {
            this._message.update(msg)
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
        this._showMessage(`${forward ? "前进" : "后退"}5s`)
    }
}

export default function install(player: Player) {
    return new Hotkey(player)
}
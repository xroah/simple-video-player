import { Player } from ".."
import { addListener, removeListener } from "../commons/dom-event"

export interface HotkeyOptions {
    showVolumeFeedback?: boolean
    showSeekFeedback?: boolean
}

class Hotkey {
    private _player: Player
    private _options: HotkeyOptions

    constructor(p: Player, options?: HotkeyOptions) {
        this._player = p
        this._options = options || {}

        addListener(p.root, "keydown", this.handleKeydown)
    }


    private handleKeydown = (evt: KeyboardEvent) => {
        const key = evt.key.toLowerCase()
        const { _player: rp } = this

        switch (key) {
            case "arrowdown":
                this.setVolume(false)
                break
            case "arrowup":
                this.setVolume()
                break
            case "arrowleft":
                this.fastSeek(false)
                break
            case "arrowright":
                this.fastSeek()
                break
            case " ": //space key
                rp.togglePlay()
                break
            case "m":
                rp.video.muted = !rp.video.muted
                break
        }

        //emit for other plugins
        rp.emit("keydown", key)
    }

    setVolume(add = true) {
        const {
            _player: {
                video,
                feedback
            },
            _options
        } = this
        const STEP = 0.05
        let volume = video.volume //the volume of video is 0-1

        if (add) {
            volume += STEP
        } else {
            volume -= STEP
        }

        if (volume < 0) {
            volume = 0
        } else if (volume > 1) {
            volume = 1
        }

        video.muted = false
        video.volume = volume

        if (feedback && _options.showVolumeFeedback) {
            feedback.showInfo("volume")
            feedback.updateVolumeFeedback(video.getPercentVolume())
        }
    }

    fastSeek(forward = true) {
        const {
            _player: rp,
            _player: {
                video,
                feedback
            },
            _options
        } = this
        const STEP = 5
        const duration = video.duration
        let curTime = video.currentTime

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

        video.currentTime = curTime
        //update the progress, if the keys were press for long time
        //the timeupdate may not fire (waiting)
        rp.emit("timeupdate")


        if (feedback && _options.showSeekFeedback) {
            feedback.showInfo("seek")
            feedback.updateSeekFeedback(curTime, duration)
        }
    }

    destroy() {
        removeListener(this._player.root, "keydown", this.handleKeydown)
    }
}

export default function hotkey(p: Player, options: HotkeyOptions) {
    let hk: Hotkey = new Hotkey(p, options)

    p.once("destroy", hk.destroy.bind(hk))
}
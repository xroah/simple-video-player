import Video from "./video"

export interface HotkeyOptions {
    showVolumeFeedback?: boolean
    showSeekFeedback?: boolean
}

export default class Hotkey {
    constructor(
        private _video: Video,
        private _target: HTMLElement
    ) {

        _target.addEventListener("keydown", this.handleKeydown)
    }


    private handleKeydown = (evt: KeyboardEvent) => {
        const key = evt.key.toLowerCase()

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
                this._video.toggle()
                break
            case "m":
                break
        }
    }

    setVolume(add = true) {
        const STEP = 5
        const v = this._video
        let volume = v.getVolume()

        if (add) {
            volume += STEP
        } else {
            volume -= STEP
        }

        if (volume < 0) {
            volume = 0
        } else if (volume > 100) {
            volume = 100
        }

        v.setMuted(false)
        v.setVolume(volume)   
    }

    fastSeek(forward = true) {
        const v = this._video
        const STEP = 5
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
        // rp.emit("timeupdate")
    }
}
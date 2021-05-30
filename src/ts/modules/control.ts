import RPlayer from ".."
import {addListener} from "../commons/dom-event"
import {EventObject} from "../commons/event-emitter"
import {throttle} from "../commons/utils"
import ControlBar from "./control-bar"

export default class Control {
    private _player: RPlayer

    bar: ControlBar

    constructor(rp: RPlayer, timeout: number) {
        this._player = rp
        this.bar = new ControlBar(rp, timeout)

        this.initEvents()
    }

    private initEvents() {
        [
            "loadedmetadata",
            "loadstart",
            "error",
            "durationchange"
        ].forEach(name => this._player.on(name, this.handleVideoEvents))
        addListener(this._player.root, "mousemove", this.handleMouseMove)
        this.bar.on("progresschange", this.handleProgressChange)
        this._player.on(
            "timeupdate",
            throttle(this.handleTimeupdate)
        ).on("progress", this.handleBuffer)
    }

    private handleMouseMove = () => {
        this.showControlBar()
    }

    showControlBar(force = false) {
        if (
            (this._player.video.isError() || this.bar.prevented) &&
            !force
        ) {
            return
        }

        this.bar.setVisible(true)
        // sync progress and current time
        this.handleTimeupdate()
    }

    hideControlBar = (force = false) => {
        if (!this.bar.prevented || force) {
            this.bar.setVisible(false)
        }
    }

    private handleVideoEvents = (evt: any) => {
        const type = evt.type
        const {
            bar,
            _player: {video}
        } = this

        switch (type) {
            case "loadedmetadata":
                bar.updateTime(video.getDuration(), "duration")
                break
            case "loadstart":
                bar.updateProgress(0)
                bar.updateBuffer(0)
                bar.updateTime(0)
                bar.updateTime(0, "duration")
                break
            case "error":
                this.hideControlBar(true)
                break
            case "durationchange":
                bar.updateTime(video.getDuration(), "duration")
                break
        }
    }

    //user click or move the progress bar manually
    private handleProgressChange = (evt: EventObject) => {
        const {video} = this._player
        const duration = video.getDuration()
        const time = evt.details / 100 * duration

        video.setCurrentTime(time)
        this.bar.updateTime(time)
    }


    handleBuffer = () => {
        const buffered = this._player.video.getBuffered()
        const curTime = this._player.video.getCurrentTime()
        let ret = 0

        for (let i = 0, l = buffered.length; i < l; i++) {
            const end = buffered.end(i)
            const start = buffered.start(i)

            //current time between start and end
            if (curTime >= start && curTime <= end) {
                ret = end
                break
            }
        }

        this.bar.updateBuffer(ret)
    }

    handleTimeupdate = () => {
        const curTime = this._player.video.getCurrentTime()
        const duration = this._player.video.getDuration()
        const val = curTime / duration * 100

        this.bar.updateProgress(val)
        this.bar.updateTime(curTime)
    }

    destroy() {
        this.bar.off()
        this.bar.destroy()
    }
}
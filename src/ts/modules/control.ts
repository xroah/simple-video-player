import { Player } from ".."
import { addListener } from "../commons/dom-event"
import { EventObject } from "../commons/event-emitter"
import { throttle } from "../commons/utils"
import ControlBar from "./control-bar"

export default class Control {
    private _player: Player

    bar: ControlBar

    constructor(p: Player, timeout: number) {
        this._player = p
        this.bar = new ControlBar(p, timeout)

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
            throttle(this.updateTime)
        ).on("progress", this.handleBuffer)
    }

    private handleMouseMove = () => {
        this.showControlBar()
    }

    showControlBar(force = false) {
        if (
            (this._player.video.error || this.bar.prevented) &&
            !force
        ) {
            return
        }

        this.bar.setVisible(true)
        // sync progress and current time
        this.updateTime()
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
            _player: { video }
        } = this

        switch (type) {
            case "loadedmetadata":
                bar.updateTime(video.duration, "duration")
                this.showControlBar()
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
                bar.updateTime(video.duration, "duration")
                break
        }
    }

    //user click or move the progress bar manually
    private handleProgressChange = (evt: EventObject) => {
        const { video } = this._player
        const duration = video.duration
        const time = evt.details / 100 * duration

        video.currentTime = time
        this.bar.updateTime(time)
    }


    private handleBuffer = () => {
        const buffered = this._player.video.buffered
        const curTime = this._player.video.currentTime
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

    updateTime = () => {
        const curTime = this._player.video.currentTime
        const duration = this._player.video.duration
        const val = curTime / duration * 100

        this.bar.updateProgress(val)
        this.bar.updateTime(curTime)
    }

    destroy() {
        this.bar.off()
        this.bar.destroy()
    }
}
import { Player } from "../.."
import { EventObject } from "../../commons/event-emitter"
import { throttle } from "../../commons/utils"
import ControlBar from "../../modules/control-bar"

class Control {
    private _player: Player
    private _bar: ControlBar

    constructor(p: Player) {
        this._player = p
        this._bar = p.controlBar

        this.initEvents()
    }

    private initEvents() {
        [
            "loadedmetadata",
            "loadstart",
            "error",
            "durationchange"
        ].forEach(name => this._player.on(name, this.handleVideoEvents))
        this._bar.on("progresschange", this.handleProgressChange)
        this._player.on(
            "timeupdate",
            throttle(this.updateTime)
        ).on("progress", this.handleBuffer)
    }

    showControlBar(force = false) {
        if (
            (this._player.video.error || this._bar.prevented) &&
            !force
        ) {
            return
        }

        this._bar.setVisible(true)
        // sync progress and current time
        this.updateTime()
    }

    hideControlBar = (force = false) => {
        if (!this._bar.prevented || force) {
            this._bar.setVisible(false)
        }
    }

    preventHide(prevented: boolean) {
        this._bar.prevented = prevented
    }

    private handleVideoEvents = (evt: any) => {
        const type = evt.type
        const {
            _bar,
            _player: { video }
        } = this

        switch (type) {
            case "loadedmetadata":
                _bar.updateTime(video.duration, "duration")
                this.showControlBar()
                break
            case "loadstart":
                _bar.updateProgress(0)
                _bar.updateBuffer(0)
                _bar.updateTime(0)
                _bar.updateTime(0, "duration")
                break
            case "error":
                this.hideControlBar(true)
                break
            case "durationchange":
                _bar.updateTime(video.duration, "duration")
                break
        }
    }

    //user click or move the progress _bar manually
    private handleProgressChange = (evt: EventObject) => {
        const { video } = this._player
        const duration = video.duration
        const time = evt.details / 100 * duration

        video.currentTime = time
        this._bar.updateTime(time)
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

        this._bar.updateBuffer(ret)
    }

    updateTime = () => {
        const curTime = this._player.video.currentTime
        const duration = this._player.video.duration
        const val = curTime / duration * 100

        this._bar.updateProgress(val)
        this._bar.updateTime(curTime)
    }
}

export default function control(p: Player) {
    new Control(p)
}
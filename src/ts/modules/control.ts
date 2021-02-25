import RPlayer from "..";
import {addListener} from "../commons/dom-event";
import {EventObject} from "../commons/event-emitter";
import {throttle} from "../commons/utils";
import ControlBar from "./control-bar";

export default class Control {
    private _rp: RPlayer

    bar: ControlBar

    constructor(rp: RPlayer, timeout: number) {
        this._rp = rp
        //control bar mount to root element
        //prevent event bubbling(this.body bind events)
        this.bar = new ControlBar(rp.root, rp.video, timeout)

        this.initEvents()
    }

    private initEvents() {
        [
            "loadedmetadata",
            "loadstart",
            "error",
            "durationchange"
        ].forEach(name => this._rp.on(name, this.handleVideoEvents))
        addListener(this._rp.body, "mousemove", this.handleMouseMove)
        this.bar.on("progresschange", this.handleProgressChange)
        this._rp.on(
            "timeupdate",
            throttle(
                this.handleTimeupdate,
                {trailing: false}
            )
        )
    }

    private handleMouseMove = () => {
        this.showControlBar()
    }

    showControlBar(force = false) {
        if (
            (this._rp.video.isError() || this.bar.prevented) &&
            !force
        ) {
            return
        }

        this.bar.setVisible(true)
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
            _rp: {video}
        } = this

        switch (type) {
            case "loadedmetadata":
                bar.updateDuration(video.getDuration())
                break
            case "loadstart":
                bar.updateProgress(0)
                bar.updateBuffer(0)
                bar.updateDuration(0)
                bar.updateCurrentTime(0)
                break
            case "error":
                this.hideControlBar(true)
                break
            case "durationchange":
                bar.updateDuration(video.getDuration())
                break
        }
    }

    //user click or move the progress bar manually
    private handleProgressChange = (evt: EventObject) => {
        const {video} = this._rp
        const duration = video.getDuration()
        const time = evt.details / 100 * duration

        video.setCurrentTime(time)
        this.bar.updateCurrentTime(time)
    }


    handleBuffer = () => {
        const buffered = this._rp.video.getBuffered()
        const curTime = this._rp.video.getCurrentTime()
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
        const curTime = this._rp.video.getCurrentTime()
        const duration = this._rp.video.getDuration()
        const val = curTime / duration * 100

        this.bar.updateProgress(val)
        this.bar.updateCurrentTime(curTime)
    }

    destroy() {
        this.bar.off()
        this.bar.destroy()
    }
}
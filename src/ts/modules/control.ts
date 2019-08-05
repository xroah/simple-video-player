import RPlayer from "..";
import {addListener} from "../dom";
import {EventObject} from "../event";
import {throttle} from "../utils";
import ControlBar from "./control-bar";

export default class Control {
    _rp: RPlayer
    _controlBar: ControlBar
    prevented = false

    constructor(rp: RPlayer, controlBar: ControlBar) {
        this._rp = rp
        this._controlBar = controlBar

        this.initEvents()
    }

    private initEvents() {
        const evtNames = [
            "loadedmetadata",
            "loadstart",
            "error",
            "durationchange"
        ]

        addListener(this._rp.body, "mousemove", this.showControlBar)
        this._controlBar.on("progresschange", this.handleProgressChange)
        evtNames.forEach(name => this._rp.on(name, this.handleVideoEvents))
        this._rp.on("timeupdate", throttle(this.updateProgress.bind(this)))
    }

    showControlBar = (force = false) => {
        if (
            (this._rp.video.isError() || this.prevented) &&
            !force
        ) {
            return
        }

        this._controlBar.setVisible(true)
    }

    hideControlBar = () => {
        this._controlBar.setVisible(false)
    }

    private handleVideoEvents = (evt: any) => {
        const type = evt.type
        const {
            _controlBar: bar,
            _rp: {video}
        } = this

        switch (type) {
            case "loadedmetadata":
                bar.updateDuration(video.getDuration())
                break
            case "loadstart":
                bar.updateProgress(0)
                bar.updateProgress(0)
                bar.updateBuffer(0)
                bar.updateDuration(0)
                bar.updateCurrentTime(0)
                break
            case "error":
                this.hideControlBar()
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

        video.setCurrentTime(evt.details / 100 * duration)
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

        this._controlBar.updateBuffer(ret)
    }

    updateProgress() {
        const curTime = this._rp.video.getCurrentTime()
        const duration = this._rp.video.getDuration()
        const val = curTime / duration * 100

        this._controlBar.updateProgress(val)
        this._controlBar.updateCurrentTime(curTime)
    }
}
import {
    formatTime,
    createEl,
    preventAndStop
} from "../commons/utils";
import Slider from "./slider";
import {addListener, removeAllListeners} from "../commons/dom-event";
import Transition from "./transition";
import {HIDDEN_CLASS} from "../constants"
import {EventObject} from "../commons/event-emitter";
import Video from "./video"
import PlayerTime from "./builtin-addons/time";

export default class ControlBar extends Transition {
    leftAddonContainer: HTMLElement
    rightAddonContainer: HTMLElement
    prevented = false

    private _progressBar: HTMLElement
    private _progress: Slider
    private _duration = 0
    private _mouseEntered = false
    private _time: PlayerTime

    constructor(container: HTMLElement, video: Video, hideTimeout: number) {
        super("rplayer-control", HIDDEN_CLASS)
        
        this.leftAddonContainer = createEl("div", "left-addon-container")
        this.rightAddonContainer = createEl("div", "right-addon-container")
        this._progressBar = createEl("div", "rplayer-progress-bar")
        this._progress = new Slider(
            this._progressBar,
            {
                tooltip: this.handleTooltip,
                secondary: true
            }
        )
        this._time = new PlayerTime(this.leftAddonContainer)
        this.hideTimeout = hideTimeout
        this.autoHide = true

        this.mountTo(container)
    }

    private mountTo(container: HTMLElement) {
        const addonContainer = createEl("div", "rplayer-addon-wrapper")
        const progressWrapper = createEl("div", "rplayer-progress-wrapper")
        
        progressWrapper.appendChild(this._progressBar)
        addonContainer.appendChild(this.leftAddonContainer)
        addonContainer.appendChild(this.rightAddonContainer)
        this.el.appendChild(progressWrapper)
        this.el.appendChild(addonContainer)
        container.appendChild(this.el)

        this.updateTime(0)
        this.updateTime(0, "duration")
        this.initEvents()
    }

    private initEvents() {
        this._progress
            .on("valuechange", this.handleSliderEvents)
            .on("slideend", this.handleSliderEvents)
            .on("tooltipupdate", this.handleSliderEvents)
        addListener(this.el, "mouseenter", this.handleMouseEnterLeave)
        addListener(this.el, "mouseleave", this.handleMouseEnterLeave)
        addListener(this.el, "click", preventAndStop)
        //prevent from selecting(for safari)
        addListener(this.el, "selectstart", preventAndStop)
        addListener(this.el, "transitionend", this.handleTransitionEnd)
    }

    private handleMouseEnterLeave = (evt: MouseEvent) => {
        if (!(this._mouseEntered = evt.type === "mouseenter")) {
            this.delayHide()
        }
    }

    //val: percent(eg. 50(50%))
    private handleTooltip = (val: number) => {
        return this._duration ?
            formatTime(this._duration * val / 100) :
            false
    }

    private handleSliderEvents = (evt: EventObject) => {
        switch (evt.type) {
            case "valuechange":
                //slider moving or click the track
                if (!this._progress.isMoving()) {
                    this.handleProgressSlideEnd(evt)
                }
                break
            case "slideend":
                this.handleProgressSlideEnd(evt)
                break
            case "tooltipupdate":
                this.emit("tooltipupdate", evt.details)
                break
        }
    }

    //slider move end
    private handleProgressSlideEnd(evt: EventObject) {
        this.emit("progresschange", evt.details)
        //click progress bar or slide end, the current time may not buffered
        //just set the buffered bar to 0
        this._progress.updateSecondary(0)
    }

    updateProgress(val: number) {
        //prevent racing(slider moving and video time update)
        if (!this._progress.isMoving()) {
            this._progress.update(val)
            this.updateTime(val)
        }
    }

    updateBuffer(val: number) {
        if (this._duration) {
            this._progress.updateSecondary(val / this._duration * 100)
        }
    }

    updateTime(val: number = 0, type: "duration" | "currentTime" = "currentTime") {
        if (val === undefined) {
            return
        }

        if (type === "currentTime") {
            this._time.updateCurrentTime(val)

            return
        }

        this._duration = val

        this._time.updateDuration(val)
    }

    //if the progress slider still moving or mouse has entered
    //the control bar should not hide
    needDelay() {
        return this.prevented || this._progress.isMoving() || this._mouseEntered
    }

    destroy() {
        this.off()
        this._progress.off()
        this._progress.destroy()
        removeAllListeners(this.el)
    }
}
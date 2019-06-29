import {formatTime} from "../utils";
import Slider from "./slider";
import {
    addListener,
    preventAndStop,
    removeAllListeners
} from "../dom";
import Transition from "./transition";
import {HIDDEN_CLASS} from "../constants"
import {EventObject} from "../event";

export default class ControlBar extends Transition {
    private _progress: Slider
    private _currentTime: HTMLElement
    private _durationEl: HTMLElement
    private _leftAddonContainer: HTMLElement
    private _rightAddonContainer: HTMLElement
    private _duration = 0
    private _mouseEntered = false

    constructor(hideTimeout: number) {
        super()

        this.el = document.createElement("div")
        this._currentTime = document.createElement("div")
        this._durationEl = document.createElement("div")
        this._leftAddonContainer = document.createElement("div")
        this._rightAddonContainer = document.createElement("div")
        this._progress = new Slider({
            tooltip: this.handleTooltip,
            secondary: true
        })
        this.hideTimeout = hideTimeout
        this.autoHide = true
    }

    mountTo(container: HTMLElement) {
        const addonContainer = document.createElement("div")
        const progressWrapper = document.createElement("div")
        const progressBar = document.createElement("div")

        this.el.classList.add("rplayer-control", HIDDEN_CLASS)
        progressWrapper.classList.add("rplayer-progress-wrapper")
        progressBar.classList.add("rplayer-progress-bar")
        addonContainer.classList.add("rplayer-addon-wrapper")
        this._leftAddonContainer.classList.add("left-addon-container")
        this._rightAddonContainer.classList.add("right-addon-container")
        progressWrapper.appendChild(this._currentTime)
        progressWrapper.appendChild(progressBar)
        progressWrapper.appendChild(this._durationEl)
        this._progress.mountTo(progressBar)
        this.el.appendChild(progressWrapper)
        addonContainer.appendChild(this._leftAddonContainer)
        addonContainer.appendChild(this._rightAddonContainer)
        this.el.appendChild(addonContainer)
        container.appendChild(this.el)

        this.updateCurrentTime(0)
        this.updateDuration(0)
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
        this.emit("progresschange", evt.details.value)

        //click progress bar or slide end, the current time may not buffered
        //just set the buffered bar to 0
        this._progress.updateSecondary(0)
    }

    updateProgress(val: number) {
        //prevent racing(slider moving and video time update)
        if (!this._progress.isMoving()) {
            this._progress.update(val)
            this.updateCurrentTime(val)
        }
    }

    updateBuffer(val: number) {
        if (this._duration) {
            this._progress.updateSecondary(val / this._duration * 100)
        }
    }

    updateCurrentTime(val: number) {
        this._currentTime.innerHTML = formatTime(val)
    }

    updateDuration(val: number) {
        this._duration = val || 0
        this._durationEl.innerHTML = formatTime(this._duration)
    }

    //if the progress slider still moving or mouse has entered
    //the control bar should not hide
    needDelay() {
        return this._progress.isMoving() || this._mouseEntered
    }

    destroy() {
        this.off()
        this._progress.off()
        this._progress.destroy()
        removeAllListeners(this.el)
    }
}
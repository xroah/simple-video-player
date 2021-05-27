import {
    formatTime,
    createEl,
    preventAndStop
} from "../commons/utils"
import Slider from "./slider"
import { addListener, addListeners, removeAllListeners } from "../commons/dom-event"
import Transition from "./transition"
import { HIDDEN_CLASS } from "../commons/constants"
import { EventObject } from "../commons/event-emitter"
import PlayerTime from "./time"
import RPlayer from "../player"
import playBtn from "../builtin/addons/play-btn"

export interface AddonOptions {
    classNames?: string[]
    text?: string
    init?: (rp: RPlayer) => void | false //return false will not add the btn to control bar
    action?: (rp: RPlayer) => void
    title?: string
}

export default class ControlBar extends Transition {
    leftAddonContainer: HTMLElement
    rightAddonContainer: HTMLElement
    prevented = false

    private _progressBar: HTMLElement
    private _progress: Slider
    private _duration = 0
    private _mouseEntered = false
    private _time: PlayerTime

    constructor(rp: RPlayer, hideTimeout: number) {
        super("rplayer-control", HIDDEN_CLASS)


        this.leftAddonContainer = createEl("div", "left-addon-container")
        this.rightAddonContainer = createEl("div", "right-addon-container")
        this._progressBar = createEl("div", "rplayer-progress-bar")
        this._progress = new Slider(
            this._progressBar,
            {
                tooltip: {
                    formatter: this.tooltipFormatter
                },
                secondary: true
            }
        )
        this.hideTimeout = hideTimeout
        this.autoHide = true
        this._time = new PlayerTime()

        this.init(rp)
    }

    private init(rp: RPlayer) {
        //init before time addon
        this.initAddon(playBtn, rp)
        this._time.mountTo(this.leftAddonContainer)
        this.updateTime(0)
        this.updateTime(0, "duration")
        this.initEvents()
        this.mountTo(rp.root)
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
    }

    initAddon(addon: AddonOptions, rp: RPlayer, right = false) {
        const {
            classNames = [],
            init,
            action
        } = addon
        const el = createEl("button", ...classNames)
        const onDestroy = () => removeAllListeners(el)
        const container = right ? this.rightAddonContainer : this.leftAddonContainer

        this.once("destroy", onDestroy)

        if (typeof init === "function") {
            const ret = init.call(el, rp)

            if (ret === false) {
                return
            }
        }

        if (typeof action === "function") {
            addListener(el, "click", () => action.call(el, rp))
        }

        el.innerText = addon.text || ""
        el.title = addon.title || ""

        container.appendChild(el)
    }

    private initEvents() {
        this._progress
            .on("valuechange", this.handleSliderEvents)
            .on("slideend", this.handleSliderEvents)
        addListeners(
            this.el,
            {
                mouseenter: this.handleMouseEnterLeave,
                mouseleave: this.handleMouseEnterLeave,
                //prevent from selecting(for safari)
                selectstart: preventAndStop
            }
        )

    }

    private handleMouseEnterLeave = (evt: MouseEvent) => {
        if (!(this._mouseEntered = evt.type === "mouseenter")) {
            this.delayHide()
        }
    }

    //val: percent(eg. 50(50%))
    private tooltipFormatter = (val: number) => {
        return this._duration ?
            formatTime(this._duration * val / 100) :
            ""
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
        // and visible
        if (!this._progress.isMoving() && this.visible) {
            this._progress.update(val)
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
            if (this.visible) {
                // only update current time when visible
                this._time.updateCurrentTime(val)
            }

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
        this.emit("destroy")
        this._progress.off()
        this._progress.destroy()
        removeAllListeners(this.el)
    }
}
import {
    createEl,
    preventAndStop
} from "../commons/utils"
import Slider from "./slider"
import {
    addListener,
    addListeners,
    removeAllListeners
} from "../commons/dom-event"
import Transition from "./transition"
import { EventObject } from "../commons/event-emitter"
import PlayerTime from "./time"
import { Player } from ".."
import playBtn from "../builtin/addons/play-btn"
import classNames from "../commons/class-names"
import { HIDDEN_CLASS } from "../commons/constants"

export interface AddonOptions {
    classNames?: string[]
    text?: string
    //return false will not add the btn to control bar
    init?: (p: Player, options?: object) => void | false
    action?: (p: Player) => void
    title?: string
    options?: object
}

export default class ControlBar extends Transition {
    private _prevented = false

    private _progress: Slider
    private _duration = 0
    private _mouseEntered = false
    private _time!: PlayerTime

    private _bufferedEl: HTMLElement
    private _leftAddonEl: HTMLElement
    private _rightAddonEl: HTMLElement

    constructor(p: Player, hideTimeout: number) {
        super(
            classNames.modules.CONTROL,
            HIDDEN_CLASS
        )

        const { modules } = classNames

        this._leftAddonEl = createEl("div", modules.CONTROL_BAR_LEFT_ADDON)
        this._rightAddonEl = createEl("div", modules.CONTROL_BAR_RIGHT_ADDON)
        this.hideTimeout = hideTimeout
        this.autoHide = true

        const progressWrapper = createEl("div", modules.PROGRESS_WRAPPER)

        this._progress = new Slider(progressWrapper)
        this._bufferedEl = createEl("div", modules.BUFFERED_PROGRESS)

        this.init(p, progressWrapper)
    }

    private init(rp: Player, wrapper: HTMLElement) {
        const { addons = [] } = rp.options

        addons.forEach(addon => this.initAddon(addon, rp, true))
        //init before time addon
        this.initAddon(playBtn, rp)

        this._time = new PlayerTime(this._leftAddonEl)

        this.initEvents()

        this.updateTime(0)
        this.updateTime(0, "duration")

        this.mountTo(rp.root, wrapper)
    }

    private mountTo(container: HTMLElement, wrapper: HTMLElement) {
        const addon = createEl("div", classNames.modules.ADDON_WRAPPER)

        addon.append(this._leftAddonEl)
        addon.append(this._rightAddonEl)

        this.el.append(wrapper)
        wrapper.prepend(this._bufferedEl)

        this.el.append(addon)
        container.append(this.el)
    }

    initAddon(addon: AddonOptions, p: Player, right = false) {
        const {
            classNames: classes = [],
            init,
            options,
            action
        } = addon
        const el = createEl(
            "button",
            classNames.addons.ADDON_BTN,
            ...classes
        )
        const onDestroy = () => removeAllListeners(el)
        const container = right ? this._rightAddonEl : this._leftAddonEl

        this.once("destroy", onDestroy)

        if (typeof init === "function") {
            const ret = init.call(el, p, options)

            if (ret === false) {
                return
            }
        }

        if (typeof action === "function") {
            addListener(el, "click", () => action.call(el, p))
        }

        el.innerText = addon.text || ""
        el.title = addon.title || ""

        container.append(el)
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
        this.updateBuffer(0)
    }

    updateBuffer(val: number) {
        if (!this._duration) {
            return
        }

        const width = val / this._duration * 100

        this._bufferedEl.style.width = `${width}%`
    }

    updateProgress(val: number) {
        //prevent racing(slider moving and video time update)
        // and visible
        if (!this._progress.isMoving() && this.visible) {
            this._progress.update(val)
        }
    }

    updateTime(
        val: number = 0,
        type: "duration" | "currentTime" = "currentTime"
    ) {
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

    preventHide(prevent: boolean) {
        this._prevented = prevent
    }

    isPrevented() {
        return this._prevented
    }

    //if the progress slider still moving or mouse has entered
    //the control bar should not hide
    needDelay() {
        return this._prevented ||
            this._progress.isMoving() ||
            this._mouseEntered
    }

    destroy() {
        this.off()
        this.emit("destroy")
        this._progress.off()
        this._progress.destroy()
        removeAllListeners(this.el)
    }
}
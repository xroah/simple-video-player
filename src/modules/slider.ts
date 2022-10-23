import { createEl } from "../utils"
import EventEmitter from "../commons/event-emitter"
import Tooltip from "./tooltip"

interface SliderOptions {
    buffer?: boolean
    tooltip?: boolean | ((v: number) => string)
    showTooltipOnHover?: boolean
}

export default class Slider extends EventEmitter {
    private _el: HTMLElement
    private _progress: HTMLElement
    private _marker: HTMLElement
    private _buffer: HTMLElement
    private _tooltip?: Tooltip
    private _value = 0
    private _moving = false
    private _mouseDown = false
    private _entered = false
    private _updated = false

    constructor(
        parent: HTMLElement,
        private _options: SliderOptions = {}
    ) {
        super()

        const PREFIX = "rplayer-slider"
        this._el = createEl("div", `${PREFIX}-wrapper`)
        this._progress = createEl("div", `${PREFIX}-progress`)
        this._marker = createEl("div", `${PREFIX}-marker`)

        if (_options.buffer) {
            this._buffer = createEl("div", `${PREFIX}-buffer`)
            this._el.appendChild(this._buffer)
        }

        if (_options.tooltip !== false) {
            this._tooltip = new Tooltip(this._el)
        }

        this._el.appendChild(this._progress)
        this._el.appendChild(this._marker)
        parent.appendChild(this._el)

        this._initEvent()
    }

    private _initEvent() {
        const el = this._el

        el.addEventListener("mousedown", this._handlemouseDown)
        document.addEventListener("mousemove", this._handleSliderMove)
        document.addEventListener("mouseup", this._handlemouseUp)

        if (
            this._tooltip &&
            this._options.showTooltipOnHover !== false
        ) {
            el.addEventListener("mousemove", this._handlemouseMove)
            el.addEventListener("mouseenter", this._handlemouseEnter)
            el.addEventListener("mouseleave", this._handlemouseLeave)
        }
    }

    private _showTooltip(e: MouseEvent) {
        const isMouse = (e as PointerEvent).pointerType === "mouse"

        if (!this._tooltip || !isMouse) {
            return
        }

        const { tooltip } = this._options
        const rect = this._el.getBoundingClientRect()
        const left = e.clientX - rect.left
        const value = left / rect.width * 100
        let text = Math.floor(value).toString()

        if (typeof tooltip === "function") {
            text = tooltip(value)
        }

        this._tooltip.updateText(text)
        this._tooltip.show(e.clientX, e.clientY)
    }

    private _hideTooltip() {
        this._tooltip?.hide()
    }

    private _handlemouseMove = (e: MouseEvent) => {
        if (!this._moving) {
            this._showTooltip(e)
        }
    }

    private _handlemouseEnter = (e: MouseEvent) => {
        this._entered = true

        this._showTooltip(e)
    }

    private _handlemouseLeave = (e: MouseEvent) => {
        this._entered = false

        if (!this._moving) {
            this._hideTooltip()
        }
    }

    private _handlemouseDown = (e: MouseEvent) => {
        const pos = this._getmousePosition(e.clientX)
        this._mouseDown = true
        this._moving = true

        this._updateProgress(pos.percent)
        this.emit("slide-start")
        this._showTooltip(e)
    }

    private updatePosition(clientX: number) {
        let { percent } = this._getmousePosition(clientX)

        if (percent < 0) {
            percent = 0
        } else if (percent > 100) {
            percent = 100
        }

        this._el.classList.add("rplayer-moving")
        this._updateProgress(percent)
        this.emit("slide-move")
    }

    private _handleSliderMove = (e: MouseEvent) => {
        if (this._mouseDown) {
            this.updatePosition(e.clientX)
            this._showTooltip(e)
        }
    }

    private _handleMoveEnd(clientX: number) {
        const { percent } = this._getmousePosition(clientX)
        const updated = this._updated
        this._updated = false
        this._mouseDown = false
        this._moving = false

        this._updateProgress(percent)
        this._el.classList.remove("rplayer-moving")
        this.emit("slide-end")

        if (updated) {
            this.emit("value-change", this._value)
        }

        if (!this._entered) {
            this._hideTooltip()
        }
    }

    private _handlemouseUp = (e: MouseEvent) => {
        if (this._mouseDown) {
            this._handleMoveEnd(e.clientX)
        }
    }

    private _getmousePosition(clientX: number) {
        const rect = this._el.getBoundingClientRect()
        const x = clientX - rect.left
        const percent = x / rect.width * 100

        return {
            left: x,
            percent
        }
    }

    private _updateProgress(val: number) {
        if (this._value !== val) {
            this._updated = true

            this.emit("value-update", val)
            this.updateProgress(val)
        }
    }

    public isMoving() {
        return this._moving
    }

    public updateProgress(val: number) {
        const percent = `${val}%`
        this._value = val
        this._marker.style.left = percent
        this._progress.style.width = percent
    }
}
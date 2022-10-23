import { createEl } from "../utils"
import EventEmitter from "../commons/event-emitter"
import Tooltip from "./tooltip"

interface SliderOptions {
    buffer?: boolean
    tooltip?: boolean | ((v: number) => string)
}

interface Position {
    clientX: number
    clientY: number
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

        el.addEventListener("pointerdown", this._handlePointerDown)
        document.addEventListener("pointermove", this._handlePointerMove)
        document.addEventListener("pointerup", this._handlePointerUp)

        if (this._tooltip) {
            el.addEventListener("pointermove", this._handleElPointerMove)
            el.addEventListener("pointerenter", this._handlePointerEnter)
            el.addEventListener("pointerleave", this._handlePointerLeave)
        }
    }

    private _showTooltip(e: Position) {
        if (!this._tooltip) {
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

    private _isTouch(e: PointerEvent) {
        return e.pointerType === "touch"
    }

    private _handleElPointerMove = (e: PointerEvent) => {
        if (!this._moving && !this._isTouch(e)) {
            this._showTooltip(e)
        }
    }

    private _handlePointerEnter = (e: PointerEvent) => {
        if (!this._isTouch(e)) {
            this._entered = true
            this._showTooltip(e)
        }
    }

    private _handlePointerLeave = (e: PointerEvent) => {
        this._entered = false

        if (!this._moving && !this._isTouch(e)) {
            this._hideTooltip()
        }
    }

    private _handlePointerDown = (e: PointerEvent) => {
        if (this._isTouch(e)) {
            return
        }

        this._handleStart(e)
    }

    private updatePosition(clientX: number) {
        let { percent } = this._getMousePosition(clientX)

        if (percent < 0) {
            percent = 0
        } else if (percent > 100) {
            percent = 100
        }

        this._el.classList.add("rplayer-moving")
        this._updateProgress(percent)
        this.emit("slide-move")
    }

    private _handleStart(position: Position) {
        const pos = this._getMousePosition(position.clientX)
        this._mouseDown = true
        this._moving = true

        this._updateProgress(pos.percent)
        this.emit("slide-start")
        this._showTooltip(position)
    }

    private _handleMoving(pos: Position) {
            this.updatePosition(pos.clientX)
            this._showTooltip(pos)
    }

    private _handlePointerMove = (e: PointerEvent) => {
        if (this._mouseDown && !this._isTouch(e)) {
            this._handleMoving(e)
        }
    }

    private _handleEnd(pos: Position) {
        const { percent } = this._getMousePosition(pos.clientX)
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

    private _handlePointerUp = (e: PointerEvent) => {
        if (this._mouseDown && !this._isTouch(e)) {
            this._handleEnd(e)
        }
    }

    private _getMousePosition(clientX: number) {
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
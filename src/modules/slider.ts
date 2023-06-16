import { createEl } from "../utils"
import EventEmitter from "../commons/event-emitter"
import { Position, SliderOptions } from "../commons/types"

export default class Slider extends EventEmitter {
    private _el: HTMLElement
    private _progress: HTMLElement
    private _marker: HTMLElement
    private _buffer?: HTMLElement
    private _value = 0
    private _moving = false
    private _mouseDown = false
    private _updated = false

    constructor(
        parent: HTMLElement,
        options: SliderOptions = {}
    ) {
        super()

        const PREFIX = "rplayer-slider"
        this._el = createEl("div", `${PREFIX}-wrapper`)
        this._progress = createEl("div", `${PREFIX}-progress`)
        this._marker = createEl("div", `${PREFIX}-marker`)

        if (options.buffer) {
            this._buffer = createEl("div", `${PREFIX}-buffer`)
            this._el.appendChild(this._buffer)
        }

        this._el.appendChild(this._progress)
        this._el.appendChild(this._marker)
        parent.appendChild(this._el)

        this._initEvent()
    }

    private _initEvent() {
        const el = this._el

        el.addEventListener("mousedown", this._handleMouseDown)
        document.addEventListener("mousemove", this._handleMouseMove)
        document.addEventListener("mouseup", this._handleMouseUp)

        el.addEventListener(
            "touchstart",
            this._handleTouchStart,
            { passive: false }
        )
        document.addEventListener(
            "touchmove",
            this._handleTouchMove,
            { passive: false }
        )
        document.addEventListener("touchend", this._handleTouchEnd)
    }

    private _updatePosition(pos: Position) {
        const percent = this.getMousePosition(pos.clientX)

        this._updateProgress(percent, pos)

        return percent
    }

    private _emit(name: string, v?: number, type?: string) {
        this.emit(
            name,
            {
                value: v,
                type
            }
        )
    }

    private _handleStart(pos: Position) {
        const percent = this.getMousePosition(pos.clientX)
        this._mouseDown = true

        this._updateProgress(percent, pos)
        this._emit("slide-start", percent, pos.type)
    }

    private _handleMouseDown = (e: MouseEvent) => {
        // not left button
        if (e.button !== undefined && e.button !== 0) {
            return
        }

        e.preventDefault()
        this._handleStart(e)
    }

    private _handleMouseMove = (e: MouseEvent) => {
        this._handleMoving(e)
    }

    private _handleMoving(pos: Position) {
        if (!this._mouseDown) {
            return
        }

        this._moving = true

        this._el.classList.add("rplayer-moving")
        this._emit(
            "slide-move",
            this._updatePosition(pos),
            pos.type
        )
    }

    private _handleEnd(pos: Position) {
        if (!this._mouseDown) {
            return
        }

        const percent = this.getMousePosition(pos.clientX)
        const updated = this._updated
        this._updated = false
        this._mouseDown = false
        this._moving = false

        this._updateProgress(percent, pos)
        this._el.classList.remove("rplayer-moving")
        this._emit("slide-end", percent, pos.type)

        if (updated) {
            this._emit("value-change", this._value, pos.type)
        }
    }

    private _handleMouseUp = (e: MouseEvent) => {
        this._handleEnd(e)
    }

    private _handleTouchStart = (e: TouchEvent) => {
        const touches = e.touches

        if (touches.length === 1) {
            this._handleStart(touches[0])
        }

        // prevent firing mouse event
        e.preventDefault()
    }

    private _handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 1) {
            this._handleMoving(e.touches[0])
            e.preventDefault()
        }
    }

    private _handleTouchEnd = (e: TouchEvent) => {
        if (!e.touches.length) {
            this._handleEnd(e.changedTouches[0])
        }
    }

    public getMousePosition(clientX: number) {
        const rect = this._el.getBoundingClientRect()
        let x = clientX - rect.left

        if (x > rect.width) {
            x = rect.width
        } else if (x < 0) {
            x = 0
        }

        return x / rect.width * 100
    }

    private _updateProgress(val: number, pos: Position) {
        if (this._value !== val) {
            this._updated = true
            this.value = val

            this._emit("value-update", val, pos.type)
        }
    }

    public get el() {
        return this._el
    }

    public get value() {
        return this._value
    }

    public set value(val: number) {
        const percent = `${val}%`
        this._value = val
        this._marker.style.left = percent
        this._progress.style.width = percent
    }

    public isMoving() {
        return this._mouseDown || this._moving
    }

    public updateBuffer(val: number) {
        if (this._buffer) {
            this._buffer.style.width = `${val}%`
        }
    }
}
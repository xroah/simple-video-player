import { createEl } from "../commons/utils"
import EventEmitter from "../commons/event-emitter"

export default class Slider extends EventEmitter {
    private _el: HTMLDivElement
    private _progress: HTMLDivElement
    private _marker: HTMLDivElement
    private _value = 0
    private _moving = false
    private _mouseDown = false

    constructor(parent: HTMLElement) {
        super()

        const PREFIX = "rplayer-slider"
        this._el = <HTMLDivElement>createEl(
            "div",
            `${PREFIX}-wrapper`
        )
        this._progress = <HTMLDivElement>createEl(
            "div",
            `${PREFIX}-progress`
        )
        this._marker = <HTMLDivElement>createEl(
            "div",
            `${PREFIX}-marker`
        )
        
        this._el.appendChild(this._progress)
        this._el.appendChild(this._marker)
        parent.appendChild(this._el)

        this.initEvent()
    }

    private initEvent() {
        this._el.addEventListener("mousedown", this._handleMouseDown)
        document.addEventListener("mousemove", this._handleMouseMove)
        document.addEventListener("mouseup", this._handleMouseUp)
    }

    private _handleMouseDown = (e: MouseEvent) => {
        const pos = this._getMousePosition(e)
        this._mouseDown = true
        
        this._updateProgress(pos.percent)
    }

    private _handleMouseMove = (e: MouseEvent) => {
        if (!this._mouseDown) {
            return
        }

        this._moving = true
        let {percent} = this._getMousePosition(e)
    
        if (percent < 0) {
            percent = 0
        } else if (percent > 100) {
            percent = 100
        }

        this._updateProgress(percent)
    }

    private _handleMouseUp = (e: MouseEvent) => {
        this._mouseDown = false
        this._moving = false
    }

    private _getMousePosition(e: MouseEvent) {
        const rect = this._el.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percent = x / rect.width * 100

        return {
            left: x,
            percent
        }
    }

    private _updateProgress(val: number) {
        if (this._value !== val) {
            this.emit("value-change", val)
        }

        this.updateProgress(val)
    }

    updateProgress(val: number) {
        const percent = `${val}%`
        this._value = val
        this._marker.style.left = percent
        this._progress.style.width = percent
    }
}
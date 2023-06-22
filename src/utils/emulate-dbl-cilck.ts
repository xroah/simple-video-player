import { DBLCLICK_THRESHOLD } from "../commons/constants"
import Timer from "../commons/timer"

interface Handler {
    (ev: Event, type: string): void
}

interface Options {
    onClick?: Handler
    onDblClick?: Handler
    target: HTMLElement
    type?: "mouse" | "touch" | "both"
    stop?: boolean
}

export default class DblClickEmulator {
    private _clickTimes = 0
    private _timer: Timer
    private _prevTimestamp = 0
    private _interval = 0

    constructor(private _options: Options) {
        const { type = "touch", target: t } = _options
        const doc = document
        const addMouseEvent = () => {
            t.addEventListener("mousedown", this._handleMouseDown)
            doc.addEventListener("mouseup", this._handleMouseUp)
        }
        const addTouchEvent = () => {
            t.addEventListener("touchstart", this._handleTouchStart)
            doc.addEventListener("touchend", this._handleTouchEnd)
        }
        this._timer = new Timer(DBLCLICK_THRESHOLD)

        switch (type) {
            case "mouse":
                addMouseEvent()
                break
            case "touch":
                addTouchEvent()
                break
            default:
                addMouseEvent()
                addTouchEvent()
        }
    }

    private _shouldIgnore(ev: MouseEvent) {
        return ev.button !== undefined && ev.button !== 0
    }

    private _handleStart(ev: Event) {
        const now = Date.now()
        // double click based on mousedown intervals
        this._interval = now - this._prevTimestamp
        this._prevTimestamp = Date.now()
        this._clickTimes++

        if (this._options.stop) {
            ev.stopPropagation()
        }

        if (this._clickTimes > 1) {
            if (this._clickTimes > 2) {
                this._clickTimes = 1
            }

            this._timer.clear()
        }
    }

    private _handleMouseDown = (ev: MouseEvent) => {
        if (!this._shouldIgnore(ev)) {
            this._handleStart(ev)
        }
    }

    private _handleEnd(ev: Event, type: string) {
        const target = ev.target as HTMLElement

        if (this._options.stop) {
            ev.stopPropagation()
        }

        // release pointer outside of the target
        if (
            ev.defaultPrevented ||
            (
                target !== this._options.target &&
                !this._options.target.contains(target)
            )
        ) {
            this._clickTimes = 0
            
            return
        }

        if (
            this._clickTimes === 2 &&
            this._interval <= DBLCLICK_THRESHOLD
        ) {
            this._clickTimes = 0

            this._timer.clear()
            this._options.onDblClick?.(ev, type)

            return
        }

        if (this._clickTimes === 1) {
            this._timer.callback = () => {
                this._clickTimes = 0

                this._options.onClick?.(ev, type)
            }

            this._timer.delay(true)
        }
    }

    private _handleMouseUp = (ev: MouseEvent) => {
        if (!this._shouldIgnore(ev)) {
            this._handleEnd(ev, "mouse")
        }
    }

    private _handleTouchStart = (ev: TouchEvent) => {
        if (ev.touches.length === 1) {
            // prevent firing mousedown event
            ev.preventDefault()
            this._handleStart(ev)
        }
    }

    private _handleTouchEnd = (ev: TouchEvent) => {
        if (!ev.touches.length) {
            this._handleEnd(ev, "touch")
        }
    }
}
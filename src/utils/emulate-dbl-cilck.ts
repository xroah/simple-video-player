import { DBLCLICK_THRESHOLD } from "../commons/constants"

interface Handler {
    (ev: Event, type: string): void
}

interface Options {
    onClick?: Handler
    onDblClick?: Handler
    target: HTMLElement
}

export default class DblClickEmulator {
    private _clickTimes = 0
    private _timer = -1
    private _prevTimestamp = 0
    private _interval = 0

    constructor(private _options: Options) {
        _options.target.addEventListener(
            "pointerdown",
            this._handlePointerDown
        )
        _options.target.addEventListener(
            "touchstart",
            this._handleTouchStart
        )
        document.addEventListener(
            "pointerup",
            this._handlePointerUp
        )
        document.addEventListener(
            "touchend",
            this._handleTouchEnd
        )
    }

    private _clearTimeout() {
        if (this._timer !== -1) {
            window.clearTimeout(this._timer)

            this._timer = -1
        }
    }

    private _shouldOmit(ev: PointerEvent) {
        return (
            ev.button !== undefined && ev.button !== 0
        ) || ev.pointerType === "touch"
    }

    private _handleStart() {
        const now = Date.now()
        // double click based on mousedown intervals
        this._interval = now - this._prevTimestamp
        this._prevTimestamp = Date.now()
        this._clickTimes++

        if (this._clickTimes > 1) {
            if (this._clickTimes > 2) {
                this._clickTimes = 1
            }

            this._clearTimeout()
        }
    }

    private _handlePointerDown = (ev: PointerEvent) => {
        if (!this._shouldOmit(ev)) {
            this._handleStart()
        }
    }

    private _handleEnd(ev: Event, type: string) {
        const target = ev.target as HTMLElement

        // release pointer outside of the target
        if (
            target !== this._options.target &&
            !this._options.target.contains(target)
        ) {
            this._clickTimes = 0

            return
        }

        if (
            this._clickTimes === 2 &&
            this._interval <= DBLCLICK_THRESHOLD
        ) {
            this._clickTimes = 0

            this._clearTimeout()

            if (!ev.defaultPrevented) {
                this._options.onDblClick?.(ev, type)
            }

            return
        }

        if (this._clickTimes === 1) {
            this._timer = window.setTimeout(
                () => {
                    this._clickTimes = 0
                    this._timer = -1

                    if (!ev.defaultPrevented) {
                        this._options.onClick?.(ev, type)
                    }
                },
                DBLCLICK_THRESHOLD
            )
        }
    }

    private _handlePointerUp = (ev: PointerEvent) => {
        if (!this._shouldOmit(ev)) {
            this._handleEnd(ev, ev.pointerType)
        }
    }

    private _handleTouchStart = (ev: TouchEvent) => {
        if (ev.touches.length === 1) {
            this._handleStart()
        }
    }

    private _handleTouchEnd = (ev: TouchEvent) => {
        if (!ev.touches.length) {
            this._handleEnd(ev, "touch")
        }
    }
}
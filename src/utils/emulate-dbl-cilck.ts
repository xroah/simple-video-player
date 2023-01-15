import { DBLCLICK_THRESHOLD } from "../commons/constants"

interface Handler {
    (e: PointerEvent): void
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
        document.addEventListener(
            "pointerup",
            this._handlePointerUp
        )
    }

    private _clearTimeout() {
        if (this._timer !== -1) {
            window.clearTimeout(this._timer)

            this._timer = -1
        }
    }

    private _handlePointerDown = (ev: PointerEvent) => {
        // main button click
        if (ev.button !== undefined && ev.button !== 0) {
            return
        }

        const now = Date.now()
        // double click based on mousedown intervals
        this._interval = now - this._prevTimestamp
        this._prevTimestamp = Date.now()
        this._clickTimes++

        if (this._clickTimes > 1) {
            this._clearTimeout()
        }
    }

    private _handlePointerUp = (ev: PointerEvent) => {
        if (ev.button !== undefined && ev.button !== 0) {
            return
        }

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

            if(!ev.defaultPrevented) {
                this._options.onDblClick?.(ev)
            }

            return
        }

        if (this._clickTimes === 1) {
            this._timer = window.setTimeout(
                () => {
                    this._clickTimes = 0
                    this._timer = -1

                    if(!ev.defaultPrevented) {
                        this._options.onClick?.(ev)
                    }
                },
                DBLCLICK_THRESHOLD
            )
        }
    }
}
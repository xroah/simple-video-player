interface Handler {
    (e: PointerEvent): void
}

interface Options {
    onClick?: Handler
    onDblClick?: Handler
    target: HTMLElement
}

const THRESHOLD = 200

export default class DblClickEmulator {
    private _clickTimes = 0
    private _timer = -1
    private _prevTimestamp = 0

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

    private _handlePointerDown = () => {
        this._clickTimes++
        this._prevTimestamp = Date.now()
    }

    private _click(ev: PointerEvent) {
        this._timer = -1
        this._clickTimes = 0

        this._options.onClick?.(ev)
    }

    private _dblClick(ev: PointerEvent) {
        this._clickTimes = 0

        this._options.onDblClick?.(ev)
    }

    private _handlePointerUp = (ev: PointerEvent) => {
        const now = Date.now()
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
            this._prevTimestamp - now <= THRESHOLD
        ) {
            this._clearTimeout()
            this._dblClick(ev)

            return
        }

        this._timer = window.setTimeout(
            () => this._click(ev),
            THRESHOLD
        )
    }
}
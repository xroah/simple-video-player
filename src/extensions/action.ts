import Player from ".."
import { CONTROL_BAR_DELAY, HIDDEN_CLASS } from "../commons/constants"
import Timer from "../commons/timer"
import { createEl } from "../utils"
import DblClickEmulator from "../utils/emulate-dbl-cilck"
import { toggleFullScreen } from "../utils/fullscreen"

const LOCKED_CLASS = "rplayer-locked"

class Action {
    private _el: HTMLElement
    private _lock: HTMLElement
    private _emulator: DblClickEmulator
    private _locked = false
    private _timer: Timer

    constructor(private _player: Player) {
        this._el = createEl("div", "rplayer-action")
        this._lock = createEl( "span", "rplayer-action-lock" )
        this._timer = new Timer(CONTROL_BAR_DELAY, this._hideLock)
        this._emulator = new DblClickEmulator({
            target: this._el,
            type: "both",
            onClick: (ev, type) => {
                if (type === "mouse") {
                    this._handleMouseClick()
                } else {
                    this._handleTouchClick()
                }
            },
            onDblClick: (ev, type) => {
                if (type === "mouse") {
                    this._handleMouseDblClick()
                } else {
                    this._handleTouchDblClick(ev as TouchEvent)
                }
            }
        })

        this._el.appendChild(this._lock)
        _player.body.appendChild(this._el)
        this._showLock()

        this._el.addEventListener(
            "pointermove",
            this._handlePointerMove
        )
        this._lock.addEventListener(
            "touchstart",
            this._handleLockTouchStart
        )
        this._lock.addEventListener(
            "mousedown",
            this._handleLockTouchStart
        )
        this._lock.addEventListener(
            "click",
            this._handleLockClick
        )
    }

    private _handleLockTouchStart = (ev: Event) => {
        ev.stopPropagation()
    }

    private _handlePointerMove = (ev: PointerEvent) => {
        if (ev.type !== "touch") {
            this._player.controlBar.show()
        }
    }

    private _handleLockClick = () => {
        this._lock.classList.toggle(LOCKED_CLASS)

        this._locked = this._lock.classList.contains(LOCKED_CLASS)

        if (this._locked) {
            this._player.controlBar.hide()
        } else {
            this._player.controlBar.show()
        }

        this._timer.delay(true)
    }

    private _handleMouseClick() {
        this._player.video.toggle()
    }

    private _handleMouseDblClick() {
        toggleFullScreen(
            this._player.root,
            this._player.video.el
        )
    }

    private _showLock() {
        this._lock.classList.remove(HIDDEN_CLASS)
        this._timer.delay(true)
    }

    private _hideLock = () => {
        this._lock.classList.add(HIDDEN_CLASS)
    }

    private _handleTouchClick() {
        this._lock.classList.toggle(HIDDEN_CLASS)
        this._timer.clear()

        if (!this._lock.classList.contains(HIDDEN_CLASS)) {
            this._timer.delay()
        }

        if (this._locked) {
            return
        }

        this._player.controlBar.toggle()
    }

    private _handleTouchDblClick(ev: TouchEvent) {
        if (this._locked) {
            return
        }

        const touch = ev.changedTouches[0]

        if (!touch) {
            return
        }

        const rect = this._el.getBoundingClientRect()
        const base = rect.width / 4
        const { video } = this._player
        const STEP = 5
        const x = touch.clientX - rect.left
        const currentTime = video.getCurrentTime()

        if (x < base) {
            video.setCurrentTime(currentTime - STEP)
        } else if (x > base * 3) {
            video.setCurrentTime(currentTime + STEP)
        } else {
            video.toggle()
        }
    }
}

export default function install(player: Player) {
    return new Action(player)
}
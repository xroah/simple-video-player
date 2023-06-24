import Player from ".."
import { HIDDEN_CLASS } from "../commons/constants"
import Timer from "../commons/timer"
import { Message } from "../modules/message"
import { createEl, formatTime } from "../utils"
import DblClickEmulator from "../utils/emulate-dbl-cilck"

const LOCKED_CLASS = "rplayer-locked"
const MOVE_THRESHOLD = 10

class Action {
    private _el: HTMLElement
    private _rateEl: HTMLElement
    private _seekInfoEl: HTMLElement
    private _timeEl: HTMLElement
    private _previewEl: HTMLElement
    private _lock: HTMLElement
    private _emulator: DblClickEmulator
    private _locked = false
    private _timer: Timer
    private _startX = 0
    private _startY = 0
    private _startTime = 0
    // determine moved or not
    private _moved = false
    // determine the same touch
    private _id = -1
    private _isMoveHorizontal = false
    private _determined = false
    private _longPressTimer: Timer
    private _originalRate = 1
    private _longPressed = false
    private _message: Message | null = null

    constructor(private _player: Player) {
        this._seekInfoEl = createEl("div", "rplayer-action-seek-info")
        this._el = createEl("div", "rplayer-action")
        this._rateEl = createEl("div", "rplayer-action-rate")
        this._rateEl.innerHTML = `
            <p>2倍速播放中</p>
            <div>
                <span></span>
                <span></span>
            </div>
        `
        this._timeEl = createEl("span", "rplayer-action-time")
        this._previewEl = createEl("div", "rplayer-action-preview")
        this._lock = createEl("span", "rplayer-action-lock")
        this._timer = new Timer(5000, this._hideLock)
        this._longPressTimer = new Timer(500, this._handleLongPress)
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
        this._seekInfoEl.appendChild(this._previewEl)
        this._seekInfoEl.appendChild(this._timeEl)
        this._el.appendChild(this._seekInfoEl)
        this._el.appendChild(this._rateEl)
        _player.body.appendChild(this._el)
        this._hideLock()
        this._hideSeekInfo()
        this._hideRateInfo()

        this._el.addEventListener(
            "touchstart",
            this._handleToucheStart,
            { passive: true }
        )
        this._el.addEventListener(
            "touchmove",
            this._handleTouchMove,
            { passive: false }
        )
        this._el.addEventListener(
            "touchend",
            this._handleTouchEnd,
            { passive: false }
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

    private _showSeekInfo() {
        this._seekInfoEl.classList.remove(HIDDEN_CLASS)
    }

    private _hideSeekInfo() {
        this._seekInfoEl.classList.add(HIDDEN_CLASS)
    }

    private _showRateInfo() {
        this._rateEl.classList.remove(HIDDEN_CLASS)
    }

    private _hideRateInfo() {
        this._rateEl.classList.add(HIDDEN_CLASS)
    }

    private _handleLockTouchStart = (ev: Event) => {
        ev.stopPropagation()
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
        this._player.toggleFullscreen()
    }

    private _hideLock = () => {
        this._lock.classList.add(HIDDEN_CLASS)
    }

    private _handleLongPress = () => {
        const v = this._player.video
        this._originalRate = v.getPlayRate()
        this._longPressed = true

        v.setPlayRate(2)
        v.play()
        this._showRateInfo()
    }

    private _resetLongPress() {
        if (this._longPressed) {
            this._player.video.setPlayRate(this._originalRate)
        }

        this._longPressed = false

        this._longPressTimer.clear()
        this._hideRateInfo()
    }

    private _handleToucheStart = (ev: TouchEvent) => {
        if (ev.touches.length > 1) {
            this._id = -1
            return
        }

        const touch = ev.touches[0]
        this._isMoveHorizontal = false
        this._determined = false
        this._moved = false
        this._longPressed = false
        this._id = touch.identifier
        this._startTime = this._player.video.getCurrentTime()
        this._startX = touch.clientX
        this._startY = touch.clientY

        this._longPressTimer.delay(true)
    }

    private _getTouch(ev: TouchEvent) {
        return Array.from(ev.changedTouches).find(
            t => t.identifier === this._id
        )
    }

    private _seek(touch: Touch, end = false) {
        const duration = this._player.video.getDuration()
        const disX = touch.clientX - this._startX

        if (!duration || Math.abs(disX) < MOVE_THRESHOLD) {
            return
        }

        const changedTime = disX / MOVE_THRESHOLD
        let time = this._startTime + changedTime

        if (time > duration) {
            time = duration
        } else if (time < 0) {
            time = 0
        }

        if (end) {
            this._player.video.setCurrentTime(time)
        }

        const timeStr = formatTime(time)
        const durationStr = formatTime(duration)
        this._timeEl.innerHTML = `${timeStr} / ${durationStr}`

        this._showSeekInfo()
    }

    private _handleTouchMove = (ev: TouchEvent) => {
        ev.preventDefault()

        if (this._id === -1 || this._longPressed) {
            return
        }

        const touch = this._getTouch(ev)

        if (!touch) {
            return
        }

        const {
            clientX: x,
            clientY: y
        } = touch

        if (
            !this._moved && (
                Math.abs(x - this._startX) >= MOVE_THRESHOLD ||
                Math.abs(y - this._startY) >= MOVE_THRESHOLD
            )
        ) {
            this._moved = true
        }

        if (this._moved) {
            this._longPressTimer.clear()
        }

        if (!this._determined) {
            const disX = Math.abs(x - this._startX)
            const disY = Math.abs(y - this._startY)

            if (
                (x !== this._startX || y !== this._startY) &&
                disX >= MOVE_THRESHOLD
            ) {
                const angle = Math.atan(disY / disX) * 180 / Math.PI
                this._isMoveHorizontal = angle <= 20
                this._determined = true
            }
        }

        if (this._isMoveHorizontal) {
            this._seek(touch)
        }
    }

    private _handleTouchEnd = (ev: TouchEvent) => {
        if (this._id === -1) {
            return
        }

        // moved or long pressed prevent clicking
        if (this._moved || this._longPressed) {
            ev.preventDefault()
        }

        if (!this._longPressed) {
            const touch = this._getTouch(ev)

            if (touch && this._isMoveHorizontal) {
                this._id = -1

                this._seek(touch, true)
                this._hideSeekInfo()
            }
        }

        this._resetLongPress()
    }

    private _handleTouchClick() {
        this._lock.classList.toggle(HIDDEN_CLASS)
        this._timer.clear()

        const lockVisible = !this._lock.classList.contains(HIDDEN_CLASS)

        if (lockVisible) {
            this._timer.delay()
        }

        if (this._locked) {
            return
        }

        if (lockVisible) {
            this._player.controlBar.show()
        } else {
            this._player.controlBar.hide()
        }
    }

    private _showMessage(msg: string) {
        if (!this._message || !this._message.visible) {
            this._message = this._player.message.open(msg)
        } else {
            this._message.update(msg)
        }
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
            this._showMessage("后退" + STEP + "s")
        } else if (x > base * 3) {
            video.setCurrentTime(currentTime + STEP)
            this._showMessage("前进" + STEP + "s")
        } else {
            video.toggle()
        }
    }
}

export default function install(player: Player) {
    return new Action(player)
}
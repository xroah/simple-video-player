import Player from ".."
import { createEl } from "../utils"
import DblClickEmulator from "../utils/emulate-dbl-cilck"
import { toggleFullScreen } from "../utils/fullscreen"

class Action {
    private _el: HTMLElement
    private _emulator: DblClickEmulator

    constructor(private _player: Player) {
        this._el = createEl("div", "rplayer-action")
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
                    this._handleTouchDblClick()
                }
            }
        })

        _player.body.appendChild(this._el)
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

    private _handleTouchClick() {
        this._player.showControlBar()
    }

    private _handleTouchDblClick() {
        this._handleMouseClick()
    }
}

export default function install(player: Player) {
    return new Action(player)
}
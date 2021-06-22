import { Player } from ".."
import { HIDDEN_CLASS } from "../commons/constants"
import { createEl, throttle } from "../commons/utils"

class MiniProgress {
    private _bar: HTMLElement
    private _progress: HTMLElement

    constructor(container: HTMLElement) {
        this._bar = createEl("div", "rplayer-mini-progress-bar")
        this._progress = createEl("div", "rplayer-mini-progress")

        this._bar.append(this._progress)
        container.append(this._bar)
    }

    updateProgress(val: number) {
        this._progress.style.width = `${val}%`
    }

    setVisible(visible: boolean) {
        this._bar.classList[visible ? "remove" : "add"](HIDDEN_CLASS)
    }

    isVisible() {
        return !this._bar.classList.contains(HIDDEN_CLASS)
    }
}

export default function miniProgress(p: Player) {
    const mp = new MiniProgress(p.root)
    const updateProgress = () => {
        const { video } = p
        const duration = video.duration

        if (duration && mp.isVisible()) {
            const val = video.currentTime / duration * 100

            mp.updateProgress(val)
        }
    }
    const show = () => {
        mp.setVisible(true)
        updateProgress()
    }

    p
        .on("timeupdate", throttle(updateProgress))
        .on("loadstart", () => mp.updateProgress(0))
        .control.bar
        .on("show", show)
        .on("hidden", () => mp.setVisible(true))
}
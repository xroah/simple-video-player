import RPlayer from ".."
import { HIDDEN_CLASS } from "../constants"
import { createEl } from "../commons/utils"

class MiniProgress {
    private _bar: HTMLElement
    private _progress: HTMLElement

    constructor(container: HTMLElement) {
        this._bar = createEl("div", "rplayer-mini-progress-bar")
        this._progress = createEl("div", "rplayer-mini-progress")

        this._bar.appendChild(this._progress)
        container.appendChild(this._bar)
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

export default (rp: RPlayer) => {
    const mp = new MiniProgress(rp.root)
    const updateProgress = () => {
        const { video } = rp
        const duration = video.getDuration()

        if (duration && mp.isVisible()) {
            const val = video.getCurrentTime() / duration * 100

            mp.updateProgress(val)
        }
    }
    const show = () => {
        mp.setVisible(true)
        updateProgress()
    }

    rp
        .on("timeupdate", updateProgress)
        .on("loadstart", () => mp.updateProgress(0))
        .control.bar
        .on("show", show)
        .on("hidden", () => mp.setVisible(true))
}
import RPlayer from ".."
import {HIDDEN_CLASS} from "../constants"
import {createEl} from "../utils"

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
        const {classList} = this._bar

        if (visible) {
            classList.remove(HIDDEN_CLASS)
        } else {
            classList.add(HIDDEN_CLASS)
        }
    }
}

export default (rp: RPlayer) => {
    const mp = new MiniProgress(rp.root)

    rp
        .on("timeupdate", () => {
            const {video} = rp
            const duration = video.getDuration()

            if (duration) {
                const val = video.getCurrentTime() / duration * 100

                mp.updateProgress(val)
            }
        })
        .on("loadstart", () => mp.updateProgress(0))
        .control.bar
        .on("show", () => mp.setVisible(false))
        .on("hidden", () => mp.setVisible(true))
}
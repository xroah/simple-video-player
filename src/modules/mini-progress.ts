import Toggle from "../commons/toggle";
import { createEl } from "../utils";

export default class MiniProgress extends Toggle {
    private _progress: HTMLElement

    constructor(parent: HTMLElement) {
        super(parent, "rplayer-mini-progress-wrapper")

        this._progress = createEl("div", "rplayer-mini-progress")

        this.el.appendChild(this._progress)
    }

    public update(progress: number) {
        this._progress.style.width = `${progress}%`
    }
}
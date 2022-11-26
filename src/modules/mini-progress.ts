import ToggleVisible from "../commons/toggle-visible";
import { createEl } from "../utils";

export default class MiniProgress extends ToggleVisible {
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
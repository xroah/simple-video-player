import { createEl, getContainer } from "./commons/utils"
import ControlBar from "./components/control-bar"

export interface RPlayerOptions {
    container: HTMLElement | Node | string
    src: string
}

export default class RPlayer {
    videoEl: HTMLVideoElement
    root: HTMLDivElement
    body: HTMLDivElement
    private _container: HTMLElement | null
    controlBar: ControlBar

    constructor(private _options: RPlayerOptions) {
        const container = getContainer(_options.container)

        if (!container) {
            throw new Error("Container is invalid")
        }

        const videoWrapper = createEl("div", "rplayer-video-wrapper")
        this._container = <HTMLElement>container
        this.videoEl = <HTMLVideoElement>createEl("video", "rplayer-video")
        this.root = <HTMLDivElement>createEl("div", "rplayer-root")
        this.body = <HTMLDivElement>createEl("div", "rplayer-body")
        this.controlBar = new ControlBar(this.videoEl, this.root)
        this.videoEl.src = _options.src

        videoWrapper.appendChild(this.videoEl)
        this.body.append(videoWrapper)
        this.root.appendChild(this.body)
        this._container.appendChild(this.root)
    }
}
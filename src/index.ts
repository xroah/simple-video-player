import { createEl, getContainer } from "./commons/utils"
import ControlBar from "./components/control-bar"
import Video from "./components/video"

export interface RPlayerOptions {
    container: HTMLElement | Node | string
    src: string
}

export default class RPlayer {
    video: Video
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
        this.root = <HTMLDivElement>createEl("div", "rplayer-root")
        this.body = <HTMLDivElement>createEl("div", "rplayer-body")
        this.video = new Video(this.body, _options.src)
        this.controlBar = new ControlBar(this.video, this.root)


        this.body.append(videoWrapper)
        this.root.appendChild(this.body)
        this._container.appendChild(this.root)

        this._initEvent()
    }

    private _initEvent() {
        this.root.addEventListener("mousemove", this.showControlBar)
        this.body.addEventListener("click", this.toggle)
    }

    toggle = () => {
        this.video.toggle()
    }

    showControlBar = () => {
        this.controlBar.setVisible(true)
    }

    hideControlBar = () => {
        this.controlBar.setVisible(false)
    }
}
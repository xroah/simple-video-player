import { createEl, getContainer } from "./commons/utils"
import ControlBar from "./components/control-bar"
import PlayState from "./components/play-state"
import Video from "./components/video"

export interface RPlayerOptions {
    container: HTMLElement | Node | string
    src: string
}

const NO_CURSOR = "rplayer-no-cursor"

export default class RPlayer {
    video: Video
    root: HTMLDivElement
    body: HTMLDivElement
    private _container: HTMLElement | null
    private _playState: PlayState
    private _cursorTimer = -1
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
        this._playState = new PlayState(this.video, this.body)
        this.controlBar = new ControlBar(this.video, this.root)


        this.body.append(videoWrapper)
        this.root.appendChild(this.body)
        this._container.appendChild(this.root)

        this._initEvent()
    }

    private _initEvent() {
        this.root.addEventListener("mousemove", this._handleMouseMove)
        this.body.addEventListener("click", this.toggle)
    }

    toggle = () => {
        this.video.toggle()
    }

    private _delayHideCursor() {
        if (this._cursorTimer !== -1) {
            clearTimeout(this._cursorTimer)
        }

        this._cursorTimer = window.setTimeout(() => {
            this.root.classList.add(NO_CURSOR)

            this._cursorTimer = -1
        }, 5000)
    }

    private _handleMouseMove = () => {
        this.root.classList.remove(NO_CURSOR)
        this._delayHideCursor()
        this.showControlBar()
    }

    showControlBar() {
        this.controlBar.setVisible(true)
    }

    hideControlBar() {
        this.controlBar.setVisible(false)
    }
}
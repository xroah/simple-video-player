import { createEl, getContainer } from "./commons/utils"
import ControlBar from "./components/control-bar"
import PlayState from "./components/play-state"
import Video from "./components/video"
import HotKey from "./components/hotkey"

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
    private _hotkey: HotKey
    controlBar: ControlBar

    constructor(private _options: RPlayerOptions) {
        const container = getContainer(_options.container)

        if (!container) {
            throw new Error("Container is invalid")
        }

        this._container = <HTMLElement>container
        this.root = <HTMLDivElement>createEl("div", "rplayer-root")
        this.root.tabIndex = -1
        this.body = <HTMLDivElement>createEl("div", "rplayer-body")
        this.video = new Video(this.body, _options.src)
        this._playState = new PlayState(this.video, this.body)
        this.controlBar = new ControlBar(this.video, this.root)
        this._hotkey = new HotKey(this.video, this.root)

        this.root.appendChild(this.body)
        this._container.appendChild(this.root)

        this._initEvent()
    }

    private _initEvent() {
        const { root, body } = this

        root.addEventListener("mousemove", this._handleMouseMove)
        body.addEventListener("click", this.toggle)

        document.addEventListener(
            "fullscreenchange",
            this._handleFullscreenChange
        )
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

    private _handleFullscreenChange = () => {
        const fsEl = document.fullscreenElement
        const CLS = "rplayer-fullscreen"

        this.root.classList.remove(CLS)
        
        if (fsEl && fsEl === this.root){
            this.root.classList.add(CLS)
        }
    }
}
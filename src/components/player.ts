import { createEl, getContainer } from "../commons/utils"
import ControlBar from "./control-bar"
import PlayState from "./play-state"
import Video from "./video"
import HotKey from "./hotkey"
import MiniProgress from "./mini-progress"
import VideoState from "./video-state"
import VolumeState from "./volume-state"

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
    private _miniProgress: MiniProgress
    private _videoState: VideoState
    private _volumeState: VolumeState
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
        this.video = new Video(this.body)
        this._playState = new PlayState(this.video, this.body)
        this.controlBar = new ControlBar(this.video, this.root)
        this._volumeState = new VolumeState(this.root)
        this._hotkey = new HotKey(this.video, this.root, this._volumeState)
        this._miniProgress = new MiniProgress(this.root, this.video)
        this._videoState = new VideoState(this.root, this.video)

        this.root.appendChild(this.body)
        this._container.appendChild(this.root)
        this.showControlBar()
        this._initEvent()
        this.video.setSrc(_options.src)
    }

    private _initEvent() {
        const {
            root,
            body,
            video
        } = this

        root.addEventListener("mousemove", this._handleMouseMove)
        body.addEventListener("click", this.toggle)

        this.controlBar.on("show", this._handleControlBarShow)
        this.controlBar.on("hidden", this._hideControlBarHidden)

        video.addListener("error", this._handleError)

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
        if (this.video.getError()) {
            return
        }

        this.root.classList.remove(NO_CURSOR)
        this._delayHideCursor()
        this.showControlBar()
    }

    private _handleError = () => {
        this.hideControlBar()
    }

    showControlBar() {
        if (this.video.getError()) {
            return
        }

        this.controlBar.setVisible(true)
    }

    hideControlBar() {
        this.controlBar.setVisible(false)
    }

    private _handleControlBarShow = () => {
        this._miniProgress.hide()
    }

    private _hideControlBarHidden = () => {
        this._miniProgress.show()
    }

    private _handleFullscreenChange = () => {
        const fsEl = document.fullscreenElement
        const CLS = "rplayer-fullscreen"

        this.root.classList.remove(CLS)

        if (fsEl && fsEl === this.root) {
            this.root.classList.add(CLS)
        }
    }
}
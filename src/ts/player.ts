import ControlBar from "./modules/control-bar";
import EventEmitter from "./event";
import LoadState, {ErrorMessage} from "./modules/load-state";
import Video from "./modules/video";
import Contextmenu, {ContextmenuItem} from "./modules/contextmenu"
import {
    addListener,
    preventAndStop,
    getContainer,
    removeAllListeners,
    createEl
} from "./dom"
import Control from "./modules/control"
import {isPlainObject, isUndef} from "./utils";
import {CONTROL_BAR_HIDE_TIMEOUT} from "./constants";
interface RPlayerOptions {
    container: string | HTMLElement | Node
    // autoPlay?: boolean
    url: string
    errorMessage?: ErrorMessage
    defaultVolume?: number
    contextmenu?: ContextmenuItem[],
    poster?: string
    playOnClick?: boolean
    controlBarTimeout?: number
}

export default class RPlayer extends EventEmitter {
    root: HTMLElement
    body: HTMLElement

    video: Video
    control: Control

    private _controlBar: ControlBar
    private _loadState: LoadState
    private _options: RPlayerOptions
    private _contextmenu: Contextmenu | null = null

    constructor(options: RPlayerOptions) {
        super()

        if (!isPlainObject(options)) {
            throw new Error("Options must be an object")
        }

        const container = getContainer(options.container)

        if (!container) {
            throw new Error("Can not find a container")
        }

        const el = createEl("div", "rplayer-root")
        const body = createEl("div", "rplayer-body")
        const controlBarTimeout = options.controlBarTimeout || CONTROL_BAR_HIDE_TIMEOUT

        //control bar mount to root element
        //prevent event bubbling(this.body bind events)
        this._controlBar = new ControlBar(el, controlBarTimeout)
        this._loadState = new LoadState(body, options.errorMessage || {})
        this._options = options

        this.video = new Video(
            body,
            {
                url: options.url,
                poster: options.poster
            }
        )
        this.root = el
        this.body = body
        this.control = new Control(this, this._controlBar)

        this.init(container as HTMLElement)
    }

    private init(container: HTMLElement) {
        let defaultVolume = this._options.defaultVolume
        this.root.tabIndex = -1

        this.initEvents()
        this.initContextmenu()

        this.root.appendChild(this.body)
        container.appendChild(this.root)

        if (isUndef(defaultVolume)) {
            defaultVolume = 50
        }

        this.video.setVolume(defaultVolume! / 100)
        this.control.showControlBar()
    }

    private initContextmenu() {
        const ctxMenu = this._options.contextmenu

        if (!ctxMenu || !ctxMenu.length) {
            return
        }

        this._contextmenu = new Contextmenu(this.root, this, ctxMenu)

        addListener(this.root, "contextmenu", this.handleContextMenu)
    }

    private handleContextMenu = (evt: MouseEvent) => {
        const {_contextmenu: ctxMenu} = this

        if (ctxMenu) {
            ctxMenu.setVisible(!ctxMenu.isVisible(), evt.clientX, evt.clientY)
        }

        preventAndStop(evt)
        this.emit(evt.type)
    }

    private initEvents() {
        const videoEl = this.video.el
        const videoEvents = [
            "abort",
            "loadedmetadata",
            "loadstart",
            "waiting",
            "canplay",
            "error",
            "loadeddata",
            "play",
            "playing",
            "pause",
            "volumechange",
            "ratechange",
            "ended",
            "seeking",
            "seeked",
            "emptied",
            "durationchange",
            "canplaythrough",
            "timeupdate",
            "progress"
        ]
        videoEvents.forEach(
            eventName => addListener(videoEl, eventName, this.handleVideoEvents)
        )

        if (this._options.playOnClick !== false) {
            addListener(this.body, "click", this.handleClickBody)
        }
    }

    handleClickBody = () => {
        this.togglePlay()
    }

    togglePlay() {
        const {
            video
        } = this

        if (video.isError()) {
            return
        }

        if (video.isPaused()) {
            video.play()
        } else {
            video.pause()
        }
    }

    private handleVideoEvents = (evt: Event) => {
        const type = evt.type
        const {
            video,
            _loadState
        } = this

        switch (type) {
            case "loadedmetadata":
                //safari will not fire canplay if the video was paused
                _loadState.setVisible(false)
                break
            case "loadstart":
                _loadState.setVisible(true)
                break
            case "waiting":
                _loadState.setVisible(true)
                break
            /* case "loadeddata":
                if (this._options.autoPlay !== false) {
                    //Uncaught (in promise) DOMException:
                    // play() failed because the user didn't interact with the document first
                    this.player.play()
                        .catch(() => {
                            this.message.update("自动播放被浏览器阻止")
                        })
                }
                break */
            case "canplay":
                _loadState.setVisible(false)
                break
            case "error":
                _loadState.setVisible(true, "error", video.el.error)
                break
            case "progress":
                this.control.handleBuffer()
        }

        this.emit(type)
    }

    destroy() {
        this.emit("destroy")
        this._controlBar.off()
        this._controlBar.destroy()
        this.root.parentNode?.removeChild(this.root)
        this._contextmenu?.destroy()
        removeAllListeners(this.video.el)
        removeAllListeners(this.root)
        removeAllListeners(this.body)
        this.off()
    }
}
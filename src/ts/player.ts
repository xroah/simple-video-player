import ControlBar from "./modules/control-bar";
import EventEmitter from "./event";
import LoadState, {ErrorMessage} from "./modules/load-state";
import Video from "./modules/video";
import Message from "./modules/message";
import Contextmenu, {ContextmenuItem} from "./modules/contextmenu"
import {
    addListener,
    preventAndStop,
    getContainer,
    removeAllListeners
} from "./dom"
import Control from "./modules/control"
import {
    isPlainObject,
    isUndef,
} from "./utils";

const CONTROL_BAR_HIDE_TIMEOUT = 3000

interface Addon {
    left?: Function[]
    right?: Function[]
}

interface RPlayerOptions {
    container: string | HTMLElement | Node
    // autoPlay?: boolean
    addons?: Addon
    url: string
    errorMessage?: ErrorMessage
    defaultVolume?: number
    contextmenu?: ContextmenuItem[],
    poster?: string
    playOnClick?: boolean
    playWhenSeeked?: boolean
}

export type RPlayerType = typeof RPlayer

export default class RPlayer extends EventEmitter {
    root: HTMLElement
    body: HTMLElement

    video: Video
    message: Message
    control: Control
    controlBar: ControlBar

    private _loadState: LoadState
    private _options: RPlayerOptions
    private _contextmenu: Contextmenu | null = null

    constructor(options: RPlayerOptions) {
        super()

        if (!isPlainObject(options)) {
            throw new Error("Options must be an object")
        }

        const el = document.createElement("div")
        const container = getContainer(options.container)
        const body = document.createElement("div")

        if (!container) {
            throw new Error("Can not find a container")
        }

        this.video = new Video({
            url: options.url,
            poster: options.poster
        })
        this.root = el
        this.body = body
        this.controlBar = new ControlBar(CONTROL_BAR_HIDE_TIMEOUT)
        this._loadState = new LoadState(options.errorMessage || {})
        this.message = new Message(this.root)
        this.control = new Control(this, this.controlBar)
        this._options = options

        this.init(container as HTMLElement)
    }

    private init(container: HTMLElement) {
        let defaultVolume = this._options.defaultVolume
        this.root.tabIndex = -1

        this.initEvents()
        this.initContextmenu()

        this.root.classList.add("rplayer-root")
        this.body.classList.add("rplayer-body")
        this.video.mountTo(this.body)
        this._loadState.mountTo(this.body)
        this.root.appendChild(this.body)
        //prevent event bubbling(this.body bind events)
        this.controlBar.mountTo(this.root)
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

        const menu = this._contextmenu = new Contextmenu(this, ctxMenu)
        const handleVisible = (evt: any) => {
            const type = `contextmenu${evt.type}`

            this.emit(type)
        }

        addListener(this.root, "contextmenu", this.handleContextMenu)
        menu.mountTo(this.root)
        menu
            .on("shown", handleVisible)
            .on("hidden", handleVisible)
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
            addListener(this.body, "click", this.handleClick)
        }
    }

    private handleContextMenu = (evt: MouseEvent) => {
        const {_contextmenu: ctxMenu} = this

        if (ctxMenu) {
            ctxMenu.setVisible(!ctxMenu.isVisible(), evt.clientX, evt.clientY)
        }

        preventAndStop(evt)
        this.emit(evt.type)
    }

    handleClick = () => {
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
            case "seeked":
                if (this._options.playWhenSeeked !== false) {
                    this.video.play()
                        .catch(() => {
                            //May cause promise error: 
                            //the play() request was interrupted by a call to pause()
                        })
                }
                break
            case "progress":
                this.control.handleBuffer(evt)
        }
        
        this.emit(type)
    }

    destroy() {
        this.emit("destroy")
        this.controlBar.destroy()
        this.controlBar.off()
        this.root.parentNode?.removeChild(this.root)
        this.message.destroy()
        this._contextmenu?.destroy()
        removeAllListeners(this.video.el)
        removeAllListeners(this.root)
        removeAllListeners(this.body)
        this.off()
    }
}
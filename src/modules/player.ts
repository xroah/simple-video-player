import { createEl, getContainer } from "../utils"
import ControlBar from "./control-bar"
import Video from "./video"
import { PlayerOptions } from "../commons/types"
import AddonManager from "./addon-manager"
import EventEmitter from "../commons/event-emitter"
import {
    exitFullscreen,
    requestFullscreen,
    toggleFullScreen
} from "../utils/fullscreen"
import MessageManager from "./message-manager"

export default class Player extends EventEmitter {
    public root: HTMLElement
    public body: HTMLElement
    public video: Video
    public controlBar: ControlBar
    public addonManager: AddonManager
    public message: MessageManager

    private _container: HTMLElement
    private _bottom: HTMLElement

    constructor(private _options: PlayerOptions) {
        super()

        const container = <HTMLElement>getContainer(_options.container)

        if (!container) {
            throw new Error("Can not find the container")
        }

        if (container.firstElementChild) {
            throw new Error(
                "The container is not empty, please try another"
            )
        }

        const el = createEl("div", "rplayer-root")
        const body = createEl("div", "rplayer-body")
        el.tabIndex = -1
        this._container = container
        this._bottom = createEl("div", "rplayer-bottom-wrapper")
        this.message = new MessageManager(this._bottom)
        this.root = el
        this.body = body
        this.video = new Video(body)
        this.controlBar = new ControlBar(
            this._bottom,
            this,
            _options.onTooltipUpdate
        )
        this.addonManager = new AddonManager(
            this.controlBar.getAddonContainer(),
            this
        )

        this._init()
    }

    public requestFullscreen() {
        requestFullscreen(this.root, this.video.el)
    }

    public exitFullscreen() {
        exitFullscreen()
    }

    public toggleFullscreen() {
        toggleFullScreen(this.root, this.video.el)
    }

    private _init() {
        const { addons, src } = this._options
        const {
            video,
            body,
            root,
            _bottom,
            _container
        } = this

        if (addons) {
            this.addonManager.installAddons(addons)
        }

        this._installExtensions()

        video.setSrc(src)
        root.appendChild(body)
        root.appendChild(_bottom)
        _container.appendChild(root)

        root.addEventListener("mousemove", this._handleMouseMove)
    }

    private _handleMouseMove = () => {
        this.controlBar.show()
    }

    private _installExtensions() {
        const { extensions } = this._options

        if (!extensions) {
            return
        }

        extensions.forEach(e => {
            if (typeof e === "function") {
                e(this)
            } else {
                e.install(this, e.options)
            }
        })
    }
}
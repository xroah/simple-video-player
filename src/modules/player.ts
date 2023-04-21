import { createEl, getContainer } from "../utils"
import ControlBar from "./control-bar"
import Video from "./video"
import { PlayerOptions } from "../commons/types"
import AddonManager from "./addon-manager"
import EventEmitter from "../commons/event-emitter"
import MiniProgress from "./mini-progress"
import { NO_CURSOR_CLASS } from "../commons/constants"

export default class Player extends EventEmitter {
    public root: HTMLElement
    public body: HTMLElement
    public video: Video
    public controlBar: ControlBar
    public addonManager: AddonManager

    private _container: HTMLElement
    private _miniProgress!: MiniProgress

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
        this.root = el
        this.body = body
        this.video = new Video(body)
        this.controlBar = new ControlBar(
            el,
            this,
            _options.onTooltipUpdate
        )
        this.addonManager = new AddonManager(
            this.controlBar.getAddonContainer(),
            this
        )

        this._init()
    }

    private _init() {
        const {
            addons,
            src,
            miniProgress
        } = this._options
        const {
            video,
            body,
            root,
            _container,
            controlBar
        } = this

        if (addons) {
            this.addonManager.installAddons(addons)
        }

        if (miniProgress !== false) {
            // use body as parent for floating
            // when page scroll and video is not in view(todo)
            this._miniProgress = new MiniProgress(body, this.video)
        }

        body.addEventListener("mousemove", this._handleMouseMove)
        controlBar.on("show", this._handleControlBarShow)
        controlBar.on("hidden", this._handleControlBarHidden)

        this._installExtensions()

        video.setSrc(src)
        root.appendChild(body)
        _container.appendChild(root)
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

    private _handleControlBarShow = () => {
        this._miniProgress?.hide()
        this.root.classList.remove(NO_CURSOR_CLASS)
    }

    private _handleControlBarHidden = () => {
        this._miniProgress.show()
        this.root.classList.add(NO_CURSOR_CLASS)
    }

    private _handleMouseMove = () => {
        this.showControlBar()
    }

    public showControlBar() {
        this.controlBar.show()
    }

    public hideControlBar() {
        this.controlBar.hide()
    }
}
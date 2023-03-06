import { createEl, getContainer } from "../utils"
import ControlBar from "./control-bar"
import Video from "./video"
import DblClickEmulator from "../utils/emulate-dbl-cilck"
import Contextmenu from "./contextmenu"
import { PlayerOptions } from "../commons/types"
import { toggleFullScreen } from "../utils/fullscreen"
import AddonManager from "./addon-manager"
import EventEmitter from "../commons/event-emitter"

export default class Player extends EventEmitter {
    public root: HTMLElement
    public body: HTMLElement
    public video: Video
    public controlBar: ControlBar
    private addonManager: AddonManager

    private _container: HTMLElement
    private _dblClickEmulator?: DblClickEmulator
    private _contextmenu?: Contextmenu

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
            { showMiniProgress: _options.showMiniProgress }
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
            contextmenu,
            defaultPointerAction
        } = this._options
        const {
            video,
            body,
            root,
            _container
        } = this

        video.setSrc(src)
        root.appendChild(body)
        _container.appendChild(root)

        body.addEventListener("pointermove", this._handlePointerMove)
        root.addEventListener("touchmove", this._handleTouchMove)

        this._installExtensions()

        if (addons) {
            this.addonManager.installAddons(addons)
        }

        if (contextmenu) {
            this._contextmenu = new Contextmenu(this, contextmenu)
        }

        if (defaultPointerAction !== false) {
            this._dblClickEmulator = new DblClickEmulator({
                onClick: this._handleClick,
                onDblClick: this._handleDblClick,
                target: this.body,
                type: "mouse"
            })
        }
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

    private _handleTouchMove = (ev: TouchEvent) => {
        ev.preventDefault()
    }

    private _handleClick = () => this.togglePlay()

    private _handleDblClick = () => toggleFullScreen(this.root)

    public togglePlay() {
        this.video.toggle()
    }

    private _handlePointerMove = (ev: PointerEvent) => {
        if (ev.pointerType !== "touch") {
            this.showControlBar()
        }
    }

    public showControlBar() {
        this.controlBar.show()
    }

    public hideControlBar() {
        this.controlBar.hide()
    }
}
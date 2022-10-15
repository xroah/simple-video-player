import {
    createEl,
    getContainer,
    toggleFullScreen
} from "../utils"
import ControlBar from "./control-bar"
import Transition from "./transition"
import Video from "./video"
import DblClickEmulator from "../utils/emulate-dbl-cilck"

interface ExtensionFn {
    (player: Player, options?: unknown): unknown
}

interface Extension {
    options?: unknown
    install: ExtensionFn
}

interface PlayerOptions {
    container: string | HTMLElement | Node
    src: string
    poster?: string
    controlBarTimeout?: number
    showMiniProgress?: boolean
    extensions?: Array<Extension | ExtensionFn>
}

export default class Player {
    public root: HTMLElement
    public body: HTMLElement
    public video: Video

    private _controlBar: ControlBar
    private _container: HTMLElement
    private _dblClickEmulator: DblClickEmulator

    constructor(private _options: PlayerOptions) {
        const container = <HTMLElement>getContainer(_options.container)

        if (!container) {
            throw new Error("Can not find a container")
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
        this._controlBar = new ControlBar(
            el,
            this.video,
            {
                showMiniProgress: _options.showMiniProgress
            }
        )
        this._dblClickEmulator = new DblClickEmulator({
            onClick: this._handleClick,
            onDblClick: this._handleDblClick
        })

        this.video.setSrc(_options.src)
        this._init()
    }

    private _init() {
        this.root.appendChild(this.body)
        this._container.appendChild(this.root)

        this.body.addEventListener(
            "pointermove",
            this._handlePointerMove
        )
        this._dblClickEmulator.emulate(this.body)

        this._installExtensions()
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

    private _handleClick = (ev: PointerEvent) => {
        if (ev.pointerType === "mouse") {
            this.togglePlay()
        } else {
            if (this._controlBar.visible) {
                this.hideControlBar()
            } else {
                this.showControlBar()
            }
        }
    }

    private _handleDblClick = (ev: PointerEvent) => {
        if (ev.pointerType === "mouse") {
            toggleFullScreen(this.root)
        } else {
            this.togglePlay()
        }
    }

    public togglePlay = () => {
        this.video.toggle()
    }

    private _handlePointerMove = (ev: PointerEvent) => {
        if (ev.pointerType === "mouse") {
            this.showControlBar()
        }
    }

    public showControlBar() {
        this._controlBar.show()
    }

    public hideControlBar() {
        this._controlBar.hide()
    }
}
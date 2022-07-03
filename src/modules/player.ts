import { createEl, getContainer, toggleFullScreen } from "../utils"
import Loading from "../extentions/loading"
import ToggleState from "../extentions/toggle-state"
import ControlBar from "./control-bar"
import Transition from "./transition"
import Video from "./video"
import DblClickEmulator from "../utils/emulate-dbl-cilck"
import Hotkey from "../extentions/hotkey"
import VolumeState from "../extentions/volume-state"

interface PlayerOptions {
    container: string | HTMLElement | Node
    src: string
    poster?: string
    controlBarTimeout?: number
    showMiniProgress?: boolean
}

export default class Player extends Transition {
    public root: HTMLElement
    public body: HTMLElement
    public video: Video

    private _controlBar: ControlBar
    private _container: HTMLElement
    private _dblClickEmulator: DblClickEmulator

    constructor(
        private _options: PlayerOptions
    ) {
        super()

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
            onClick: this._togglePlay,
            onDblClick: this._handleDblClick
        })
        new ToggleState(this.video, el)
        new Loading(this.video, el)
        new Hotkey(el, this.video)
        new VolumeState(this.video, el)

        this.video.setSrc(_options.src)
        this._init()
    }

    private _init() {
        this.root.appendChild(this.body)
        this._container.appendChild(this.root)

        this.body.addEventListener(
            "mousemove",
            this._handleMouseMove
        )
        this._dblClickEmulator.emulate(this.body)
    }

    private _togglePlay = () => {
        this.video.toggle()
    }

    private _handleDblClick = () => {
        toggleFullScreen(this.root)
        console.log("dblclick")
    }

    private _handleMouseMove = () => {
        this._controlBar.show()
    }
}
import { createEl, getContainer } from "../utils"
import Loading from "../extentions/loading"
import ToggleState from "../extentions/toggle-state"
import ControlBar from "./control-bar"
import Transition from "./transition"
import Video, { RPlayerOptions } from "./video"
import DblClickEmulator from "../utils/emulate-dbl-cilck"

interface PlayerOptions {
    container: string | HTMLElement | Node
    src: string
    poster?: string
    controlBarTimeout?: number
}

export default class Player extends Transition {
    public root: HTMLElement
    public body: HTMLElement
    public video: Video

    private _controlBar: ControlBar
    private _container: HTMLElement
    private _dblClickEmulator: DblClickEmulator

    constructor(
        private _options: RPlayerOptions
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
        this._container = container
        this.root = el
        this.body = body
        this.video = new Video(body)
        this._controlBar = new ControlBar(el, this.video)
        this._dblClickEmulator = new DblClickEmulator({
            onClick: this._togglePlay
        })
        new ToggleState(this.video, el)
        new Loading(this.video, el)

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

    private _handleMouseMove = () => {
        this._controlBar.show()
    }
}
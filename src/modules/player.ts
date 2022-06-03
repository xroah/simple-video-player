import { createEl, getContainer } from "../commons/utils"
import Transition from "./transition"

interface PlayerOptions {
    container: string | HTMLElement | Node
    url: string
    poster?: string
    controlBarTimeout?: number
}

export default class Player extends Transition {
    public root: HTMLElement
    public body: HTMLElement
    
    private _container: HTMLElement
    private _options: PlayerOptions

    constructor(options: PlayerOptions) {
        super()

        const container = <HTMLElement>getContainer(options.container)

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
        this._options = options

        this.init()
    }

    init() {
        this.root.appendChild(this.body)
        this._container.appendChild(this.root)
    }
}
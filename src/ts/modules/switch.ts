import { addListener } from "../commons/dom-event"
import EventEmitter from "../commons/event-emitter"
import { createEl } from "../commons/utils"

let uid = 0

export class Switch extends EventEmitter {
    private _input: HTMLInputElement
    private _wrapper: HTMLElement
    
    constructor(id: string) {
        super()

        const input = createEl("input") as HTMLInputElement
        input.id = id || `rplayer-switch-${uid++}`
        input.type = "checkbox"

        this._input = input
        this._wrapper = createEl("span", "rplayer-switch")

        this.init()
    }

    private init() {
        const label = createEl("label")

        label.setAttribute("for", this._input.id)
        this._wrapper.appendChild(this._input)
        this._wrapper.appendChild(label)

        addListener(this._input, "change", this.handleChange)
    }

    mountTo(container: HTMLElement) {
        container.appendChild(this._wrapper)
    }

    check(checked: boolean) {
        this._input.checked = checked
    }

    isChecked() {
        return this._input.checked
    }

    private handleChange = () => {
        this.emit("change", this._input.checked)
    }
}
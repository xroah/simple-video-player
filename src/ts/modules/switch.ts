import classNames from "../commons/class-names"
import { addListener } from "../commons/dom-event"
import EventEmitter from "../commons/event-emitter"
import { createEl } from "../commons/utils"

let uid = 0

export class Switch extends EventEmitter {
    private _input: HTMLInputElement
    private _wrapper: HTMLElement
    private _id: string

    constructor(id?: string) {
        super()

        const input = createEl("input") as HTMLInputElement
        const CLASS = classNames.modules.SWITCH

        input.id = id || `${CLASS}-${uid++}`
        input.type = "checkbox"

        this._input = input
        this._id = input.id
        this._wrapper = createEl("span", CLASS)

        this.init()
    }

    private init() {
        const label = createEl("label")

        label.setAttribute("for", this._input.id)
        this._wrapper.append(this._input)
        this._wrapper.append(label)

        addListener(this._input, "change", this.handleChange)
    }

    mountTo(container: HTMLElement) {
        container.append(this._wrapper)
    }

    check(checked: boolean) {
        this._input.checked = checked
    }

    isChecked() {
        return this._input.checked
    }

    private handleChange = () => {
        this.emit(
            "change",
            {
                target: this._input,
                checked: this.isChecked(),
                id: this._id
            }
        )
    }

    destroy() {
        this.off()
    }
}
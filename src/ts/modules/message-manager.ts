import {createEl} from "../dom"
import {EventObject} from "../event"
import {isUndef} from "../utils"
import Message, {PREFIX} from "./message"

export default class MessageManager {
    private _messages: Map<number, Message> | null = null
    private _wrapper: HTMLElement

    constructor(container: HTMLElement) {
        this._wrapper = createEl("div", PREFIX)

        container.appendChild(this._wrapper)
    }

    show(msg: HTMLElement | string, options?: MessagePort) {
        const message = new Message(this._wrapper, options)
        const handleDestroy = (evt: EventObject) => {
            if (this._messages) {
                this._messages.delete(evt.details)
                this._wrapper.removeChild(message.getEl()!)
            }
        }

        if (!this._messages) {
            this._messages = new Map()
        }

        this._messages.set(message.uid, message)
        message.update(msg)
        message.once("destroy", handleDestroy)

        return message
    }

    destroy(msg?: Message) {
        if (!this._messages) {
            return
        }

        if (!isUndef(msg)) {
            const message = this._messages.get(msg!.uid)

            if (message) {
                message.destroy()
            }
        } else {
            this._messages.forEach(msg => msg.destroy())

            this._messages = null
        }
    }
}
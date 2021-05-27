import {isUndef, createEl} from "../commons/utils"
import Message, {MessageOptions, PREFIX} from "./message"

export default class MessageManager {
    private _messages: Map<number, Message> | null = null
    private _wrapper: HTMLElement

    constructor(container: HTMLElement) {
        this._wrapper = createEl("div", `${PREFIX}-wrapper`)

        container.appendChild(this._wrapper)
    }

    removeMessage(message: Message) {
        const {uid} = message

        if (this._messages && this._messages.has(uid)) {
            this._messages.delete(uid)
        }
    }

    show(msg: HTMLElement | string, options?: MessageOptions) {
        const message = new Message(this._wrapper, options)
        
        if (!this._messages) {
            this._messages = new Map()
        }

        this._messages.set(message.uid, message)
        message.show(msg)
        message.once("destroy", () => this.removeMessage(message))

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
                this.removeMessage(message)
            }
        } else {
            this._messages.forEach(msg => msg.destroy())

            this._messages = null
        }
    }
}
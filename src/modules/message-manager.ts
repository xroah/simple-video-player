import { createEl } from "../utils"
import { Message, MessageOptions } from "./message"

export default class MessageManager {
    private _wrapper: HTMLElement 
    private _messageMap = new Map<number, Message>()

    constructor(container: HTMLElement) {
        this._wrapper = createEl("div", "rplayer-message-wrapper")
        
        container.appendChild(this._wrapper)
    }

    public open(msg: string, options?: MessageOptions) {
        const message = new Message(this._wrapper, {
            ...options,
            content: msg
        })

        message.once("hidden", () => this._messageMap.delete(message.id))
        this._messageMap.set(message.id, message)
        message.show()
        
        return message
    }

    public closeAll() {
        this._messageMap.forEach(v => v.hide(true))
    }
}
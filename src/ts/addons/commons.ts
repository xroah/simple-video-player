import Popup from "../modules/popup"

export function handleMouseEnter(this: Popup, evt: MouseEvent) {
    this.setVisible(true)
    this.updatePositionByRelativeEl(evt.target as HTMLElement)
}

export function handleMouseLeave(this: Popup) {
    this.delayHide()
}
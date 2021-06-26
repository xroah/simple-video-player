import classNames from "./class-names"

export const HIDDEN_CLASS = classNames.commons.HIDDEN
export const SHOW_CLASS = classNames.commons.SHOW
export const CONTROL_BAR_HIDE_TIMEOUT = 3000
export const EVENT_LISTENER_KEY = "R_PLAYER_LISTENERS_KEY"
export const videoEvents = [
    "abort",
    "loadedmetadata",
    "loadstart",
    "waiting",
    "canplay",
    "error",
    "loadeddata",
    "play",
    "playing",
    "pause",
    "volumechange",
    "ratechange",
    "ended",
    "seeking",
    "seeked",
    "emptied",
    "durationchange",
    "canplaythrough",
    "timeupdate",
    "progress"
]
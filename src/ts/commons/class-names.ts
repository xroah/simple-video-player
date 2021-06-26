function prefix(className: string) {
    return `rplayer-${className}`
}

export default {
    commons: {
        SHOW: prefix("show"),
        HIDDEN: prefix("hidden"),
        ACTIVE: prefix("active"),
        PAUSED: prefix("paused"),
        FULLSCREEN: prefix("fullscreen"),
        CLOSE_BTN: prefix("close-btn"),
        MUTED: prefix("muited")
    },
    addons: {
        ADDON_BTN: prefix("addon-btn"),
        FULLSCREEN_BTN: prefix("fullscreen-btn"),
        PIP_BTN: prefix("pip-btn"),
        PIP_ENTERED: prefix("pip-entered"),
        RATE_BTN: prefix("rate-btn"),
        RATE_POPUP: prefix("rate-popup"),
        SETTINGS_POPUP: prefix("settings-popup"),
        SETTINGS_ITEM: prefix("settings-item"),
        SETTINGS_LABEL: prefix("settings-label"),
        VOLUME_POPUP: prefix("volume-popup"),
        VOLUME_SLIDER: prefix("volume-slider"),
        VOLUME_BTN: prefix("volume-btn"),
        PLAY_BTN: prefix("play-btn")
    },
    plugins: {
        STATE_WRAPPER: prefix("state-wrapper"),
        LOADING_SPINNER: prefix("loading-spinner"),
        ERROR_MESSAGE: prefix("error-message"),
        NO_CURSOR: prefix("no-cursor"),
        OPERATION: prefix("operation"),
        OPERATION_PAUSE: prefix("operation-pause"),
        PLAY_STATE_ICON: prefix("play-state-icon"),
        MINI_PROGRESS: prefix("mini-progress"),
        MINI_PROGRESS_BAR: prefix("mini-progress-bar")
    },
    modules: {
        CONTEXTMENU: prefix("contextmenu-item"),
        CONTEXTMENU_ITEM: prefix("contextmenu-item"),
        CONTROL: prefix("control"),
        ADDON_WRAPPER: prefix("addon-wrapper"),
        CONTROL_BAR_LEFT_ADDON: prefix("left-addon-container"),
        CONTROL_BAR_RIGHT_ADDON: prefix("right-addon-container"),
        PROGRESS_WRAPPER: prefix("progress-wrapper"),
        BUFFERED_PROGRESS: prefix("buffered-progress"),
        FEEDBACK_WRAPPER: prefix("feedback-wrapper"),
        VOLUME_INFO_ICON: prefix("volume-info-icon"),
        MESSAGE_WRAPPER: prefix("message-wrapper"),
        MESSAGE_ITEM: prefix("message-item"),
        MESSAGE_TEXT: prefix("message-text"),
        MESSAGE_ITEM_INNER: prefix("message-item-inner"),
        ROOT: prefix("root"),
        BODY: prefix("body"),
        POPUP: prefix("popup"),
        SLIDER_WRAPPER: prefix("slider-wrapper"),
        SLIDER_WRAPPER_VERTICAL: prefix("slider-wrapper-vertical"),
        SLIDER_MARKER: prefix("slider-marker"),
        SLIDER_PRIMARY: prefix("slider-primary"),
        SLIDER_TRACK: prefix("slider-track"),
        SLIDER_MOVING: prefix("slider-moving"),
        SWITCH: prefix("switch"),
        TIME_INFO: prefix("time-info"),
        TOOLTIP: prefix("tooltip"),
        TOOLTIP_VERTICAL: prefix("tooltip-vertical"),
        VIDEO: prefix("video"),
        VIDEO_WRAPPER: prefix("video-wrapper")
    }
}
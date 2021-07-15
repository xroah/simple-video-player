function prefix(className: string) {
    return `rplayer-${className}`
}

const classNames = {
    commons: {
        SHOW: "show",
        HIDDEN: "hidden",
        ACTIVE: "active",
        PAUSED: "paused",
        FULLSCREEN: "fullscreen",
        CLOSE_BTN: "close-btn",
        MUTED: "muted"
    },
    addons: {
        ADDON_BTN: "addon-btn",
        FULLSCREEN_BTN: "fullscreen-btn",
        PIP_BTN: "pip-btn",
        PIP_ENTERED: "pip-entered",
        RATE_BTN: "rate-btn",
        RATE_POPUP: "rate-popup",
        SETTINGS_POPUP: "settings-popup",
        SETTINGS_ITEM: "settings-item",
        SETTINGS_LABEL: "settings-label",
        SETTINGS_BTN: "settings-btn",
        VOLUME_POPUP: "volume-popup",
        VOLUME_SLIDER: "volume-slider",
        VOLUME_BTN: "volume-btn",
        PLAY_BTN: "play-btn",
        RATE_ITEM: "rate-item"
    },
    plugins: {
        STATE_WRAPPER: "state-wrapper",
        LOADING_SPINNER: "loading-spinner",
        ERROR_MESSAGE: "error-message",
        NO_CURSOR: "no-cursor",
        OPERATION: "operation",
        OPERATION_PAUSE: "operation-pause",
        PLAY_STATE_ICON: "play-state-icon",
        MINI_PROGRESS: "mini-progress",
        MINI_PROGRESS_BAR: "mini-progress-bar",
        CONTEXTMENU: "contextmenu",
        CONTEXTMENU_ITEM: "contextmenu-item",
        TOOLTIP_WRAPPER: "tooltip-wrapper",
        TOOLTIP_TEXT: "tooltip-text"
    },
    modules: {
        CONTROL: "control",
        ADDON_WRAPPER: "addon-wrapper",
        CONTROL_BAR_LEFT_ADDON: "left-addon-container",
        CONTROL_BAR_RIGHT_ADDON: "right-addon-container",
        PROGRESS_WRAPPER: "progress-wrapper",
        BUFFERED_PROGRESS: "buffered-progress",
        FEEDBACK_WRAPPER: "feedback-wrapper",
        VOLUME_INFO_ICON: "volume-info-icon",
        MESSAGE_WRAPPER: "message-wrapper",
        MESSAGE_ITEM: "message-item",
        MESSAGE_TEXT: "message-text",
        MESSAGE_ITEM_INNER: "message-item-inner",
        ROOT: "root",
        BODY: "body",
        POPUP: "popup",
        SLIDER_WRAPPER: "slider-wrapper",
        SLIDER_WRAPPER_VERTICAL: "slider-wrapper-vertical",
        SLIDER_MARKER: "slider-marker",
        SLIDER_PRIMARY: "slider-primary",
        SLIDER_TRACK: "slider-track",
        SLIDER_MOVING: "slider-moving",
        SWITCH: "switch",
        TIME_INFO: "time-info",
        VIDEO: "video",
        VIDEO_WRAPPER: "video-wrapper"
    }
}

function prefixAll(classes: typeof classNames) {
    let key: keyof typeof classes
    
    for (key in classes) {
        const v = <any>classes[key] 
        let clsKey: keyof typeof v

        for (clsKey in v) {
            const className = v[clsKey]

            v[clsKey] = prefix(className)
        }
    }
}

prefixAll(classNames)

export default classNames
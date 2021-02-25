
import RPlayer from "..";
import {
    addListener,
    removeAllListeners,
    removeListener
} from "../commons/dom-event";
import {createEl} from "../utils";

interface API {
    request: string
    exit: string
    element: string
    change: string
    error: string
}

const fullscreenApi = (() => {
    const el = document.createElement("el")
    const apis: API[] = [{
        request: "requestFullscreen",
        exit: "exitFullscreen",
        element: "fullscreenElement",
        change: "fullscreenchange",
        error: "fullscreenerror"
    }, {
        request: "webkitRequestFullscreen",
        exit: "webkitExitFullscreen",
        element: "webkitFullscreenElement",
        change: "webkitfullscreenchange",
        error: "webkitfullscreenerror"
    }, {
        request: "mozRequestFullscreen",
        exit: "mozFullscreen",
        element: "mozFullscreenElement",
        change: "mozfullscreenchange",
        error: "mozfullscreenerror"
    }]
    let ret: API | undefined

    for (let val of apis) {
        if (val.request in el) {
            ret = val
            break
        }
    }

    return ret
})()


export default (rp: RPlayer) => {
    const video = rp.video.el as any

    if (!fullscreenApi || !video.webkitEnterFullScreen) {
        return
    }

    const btn = createEl("span", "rplayer-addon-btn", "rplayer-fullscreen-btn")
    const toggleFS = () => {
        const video = rp.video.el as any

        if (!fullscreenApi) {
            //ios
            if (video.webkitEnterFullScreen) {
                video.webkitEnterFullScreen()
            }

            return
        }

        if (!getFSEl()) {
            (rp.root as any)[fullscreenApi.request]()
        } else {
            (document as any)[fullscreenApi.exit]()
        }
    }

    const getFSEl = () => {
        return fullscreenApi ? (document as any)[fullscreenApi.element] : null
    }
    const handleKeydown = (key: any) => {
        if (key === "enter") {
            toggleFS()
        }
    }
    const handleFSChange = () => {
        rp.root.classList[getFSEl() ? "add" : "remove"]("rplayer-fullscreen");
    }

    addListener(document, fullscreenApi.change, handleFSChange)
    addListener(btn, "click", toggleFS)
    rp
        .on("keydown", handleKeydown)
        .once("destroy", () => {
            removeListener(document, fullscreenApi.change, handleFSChange)
            removeAllListeners(btn)
        })
        .once("beforemount", () => {
            const {right} = rp.getAddonContainers()

            right.appendChild(btn)
        })
}
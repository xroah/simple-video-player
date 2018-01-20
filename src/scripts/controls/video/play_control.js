import dom from "../../dom/index.js";
import {VIDEO_CLICK, VIDEO_PAUSE, VIDEO_PLAYING} from "./video_control.js";

export default class PlayControl {
    constructor() {
        this.btn = dom.createElement("button", {"class": "rplayer-play-btn"});
    }

    play() {
        dom.addClass(this.btn, "paused");
        return this;
    }

    pause() {
        dom.removeClass(this.btn, "paused");
        return this;
    }

    toggle() {
        this.media.togglePlay();
        return this;
    }

    initEvent() {
        let toggle = this.toggle.bind(this);
        dom.on(this.btn, "click", toggle);
        this.media
            .on(VIDEO_PLAYING, this.play.bind(this))
            .on(VIDEO_PAUSE, this.pause.bind(this))
            .on(VIDEO_CLICK, toggle);
        return this;
    }

    init(target, media) {
        target.appendChild(this.btn);
        this.media = media;
        return this.initEvent();
    }
}



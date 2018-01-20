import dom from "../../dom/index.js";
import Subscriber from "../../subscriber.js";

export const PLAY_CONTROL_PLAY = "play.control.play";
export const PLAY_CONTROL_PAUSE = "play.control.pause";
export const PLAY_CONTROL_TOGGLE = "play.control.toggle";

export default class PlayControl extends Subscriber{
    constructor() {
        super();
        this.btn = dom.createElement("button", {"class": "rplayer-play-btn"});
        this.paused = true;
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
        this.trigger(PLAY_CONTROL_TOGGLE, this.paused = !this.paused);
        return this;
    }

    initEvent() {
        dom.on(this.btn, "click", this.toggle.bind(this));
        this.on(PLAY_CONTROL_PAUSE, this.pause.bind(this))
            .on(PLAY_CONTROL_PLAY, this.play.bind(this));
        return this;
    }

    init(target) {
        target.appendChild(this.btn);
        return this.initEvent();
    }
}



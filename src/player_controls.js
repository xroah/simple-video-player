function PlayerControls() {
    this.el = doc.createElement("div");
};

PlayerControls.prototype = {
    constructor: PlayerControls,
    initEvent: function () {

    },
    initElements: function () {
        var context = this.el;
        this.playBtn = dom.selectElement(".rplayer-play-btn", context);
        this.videoTrack = dom.selectElement(".rplayer-video-track", context);
        this.videoSlider = dom.selectElement(".rplayer-video-slider", context);
        this.videoProgress = dom.selectElement(".rplayer-video-progress", context);
        this.videoPopupTime = dom.selectElement(".rplayer-popup-video-info", context);
        this.currentTime = dom.selectElement(".rplayer-current-time", context);
        this.totalTime = dom.selectElement(".rplayer-total-time", context);
        this.bufferedBar = dom.selectElement(".rplayer-bufferd-bar", context);
        this.showVolumePopBtn = dom.selectElement(".rplayer-audio-btn", context);
        this.muteBtn = dom.selectElement(".rplayer-mute", context);
        this.volumePopup = dom.selectElement(".rplayer-volume-popup", context);
        this.volumePopupInfo = dom.selectElement(".rplayer-popup-volume-info", context);
        this.volumeSlider = dom.selectElement(".rplayer-volume-slider", context);
        this.volumeProgress = dom.selectElement(".rplayer-volume-progress", context);
        this.volumeValue = dom.selectElement(".rplayer-volume-value", context);
        this.currentVolume = dom.selectElement(".rplayer-current-volume", context);
        this.fullScreenBtn = dom.selectElement(".rplayer-fullscreen-btn", this.container);
        return this;
    },
    init: function () {
        this.el.innerHTML = controls;
        dom.addClass(this.el, "rplayer-controls")
            .addClass(this.el, "rplayer-hide");
    }
};
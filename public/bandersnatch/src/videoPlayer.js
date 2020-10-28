class VideoMediaPlayer {
    constructor({ manifestJSON }) {
        this.videoElement = null;
        this.sourceBuffer = null;
    }

    initializeCodec() {
        this.videoElement = document.getElementById("vid");
        const mediaSourceSupported = !!window.MediaSource
        if(!mediaSourceSupported) {
            alert('Seu browser ou sistema nao tem suporte a MSE!');
            return;
        }

        const codecSupported = MediaSource.isTypeSupported();
    }
}
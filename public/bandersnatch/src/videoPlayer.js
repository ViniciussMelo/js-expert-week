class VideoMediaPlayer {

    constructor({ manifestJSON, network, videoComponent }) {
        this.manifestJSON = manifestJSON;
        this.network = network;
        this.videoComponent = videoComponent;

        this.videoElement = null;
        this.sourceBuffer = null;
        this.activeItem = {};
        this.selected = {};
        this.videoDuration = 0;
    }

    initializeCodec() {
        this.videoElement = document.getElementById("vid");

        const mediaSourceSupported = !!window.MediaSource;

        if(!mediaSourceSupported) {
            alert('Seu browser ou sistema nao tem suporte a MSE!');
            return;
        }

        const codecSupported = MediaSource.isTypeSupported(this.manifestJSON.codec);
        if(!codecSupported){
            alert(`Seu browser não suporta o codec: ${this.manifestJSON.codec}`);
        }

        const mediaSource = new MediaSource();
        this.videoElement.src = URL.createObjectURL(mediaSource);

        mediaSource.addEventListener("sourceopen", this.sourceOpenWrapper(mediaSource));
    }

    sourceOpenWrapper(mediaSourse) {
        return async (_) => {
            this.sourceBuffer = mediaSourse.addSourceBuffer(this.manifestJSON.codec); // object with codec only
            const selected = this.selected = this.manifestJSON.intro;

            // avoid runnig as live
            mediaSourse.duration = this.videoDuration;
            await this.fileDownload(selected.url);
            
            // call and pass the context 
            setInterval(this.waitForQuestions.bind(this), 200);
        }
    }

    waitForQuestions() {
        const currentTime = parseInt(this.videoElement.currentTime);
        const option = this.selected.at === currentTime;
        
        if(!option) return;
        // prevent the modal from appearing 2 times
        if(this.activeItem.url === this.selected.url) return;

        this.videoComponent.configureModal(this.selected.options);
        this.activeItem = this.selected;
    }

    async nextChunk(data) {
        const key = data.toLowerCase();
        const selected = this.manifestJSON[key];
        this.selected = {
            ...selected,
            // adjust the time the modal will appear based on the current time
            at: parseInt(this.videoElement.currentTime + selected.at)
        };

        // leave the rest of the video running while downloading the new one
        this.videoElement.play();
        await this.fileDownload(selected.url);
    }

    async fileDownload(url){
        const prepareUrl = {
            url,
            fileResolution: 360,
            fileResolutionTag: this.manifestJSON.fileResolutionTag,
            hostTag: this.manifestJSON.hostTag
        };
        const finalUrl = this.network.parseManifestURL(prepareUrl);
        this.setVideoPlayerDuration(finalUrl); // update the duration
        const data = await this.network.fetchFile(finalUrl);
        return this.processBufferSegments(data);
    }

    setVideoPlayerDuration(finalUrl){
        const bars = finalUrl.split('/');
        const [name, videoDuration] = bars[bars.length - 1].split('-'); // take the duration => name/DURATION/resolution.extension
        this.videoDuration += parseFloat(videoDuration); // make the videoDuration as float and not a string
    }

    async processBufferSegments(allSegments){
        const sourceBuffer = this.sourceBuffer;
        sourceBuffer.appendBuffer(allSegments);

        return new Promise((resolve, reject) => {
            const updateEnd = () => {
                sourceBuffer.removeEventListener("updateend", updateEnd);
                sourceBuffer.timestampOffset = this.videoDuration;

                return resolve();
            }

            sourceBuffer.addEventListener("updateend", updateEnd);
            sourceBuffer.addEventListener("error", reject);
        })
    }
}
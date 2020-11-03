class Network {
    
    constructor ({ host }) {
        this.host = host;
    }

    parseManifestURL({ url, fileResolution, fileResolutionTag, hostTag }){
        return url.replace(fileResolutionTag, fileResolution).replace(hostTag, this.host);
    }

    async fetchFile(url){
        const response = await fetch(url);
        return response.arrayBuffer();
    }

    async getProperResolution(url) {
        const startMs = Date.now();
        const response = await fetch(url);
        await response.arrayBuffer();
        const endMs = Date.now();
        const durationInMs = (endMs - startMs);

        // Instead of calculating the throughput we weill calculate by the time
        const resolutions = [
            // worst possible scenario, 20 seconds
            { start: 3001, end: 20000, resolution: 144 },
            // up to 3 seconds
            { start: 901, end: 3000, resolution: 360 },
            // less than 1 second
            { start: 0, end: 900, resolution: 720 },
        ];

        const item = resolutions.find(item => {
            return item.start <= durationInMs && item.end >= durationInMs;
        });

        const LOWEST_RESOLUTION = 144;
        // if its more than 30 seconds
        if(!item) return LOWEST_RESOLUTION;

        return item.resolution;
    }
}
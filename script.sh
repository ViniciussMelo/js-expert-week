ASSETSFOLDER=assets/timeline #path
for mediaFile in `ls $ASSETSFOLDER | grep .mp4`; do # list files in the directory
    # cortar a extensao e a resolucao do arquivo
    FILENAME=$(echo $mediaFile | sed -n 's/.mp4//p' | sed -n 's/-1920x1080//p')
    INPUT=$ASSETSFOLDER/$mediaFile
    FOLDER_TARGET=$ASSETSFOLDER/$FILENAME
    mkdir -p $FOLDER_TARGET # create folder

    # create files of different resolutions in the folder 
    OUTPUT=$ASSETSFOLDER/$FILENAME/$FILENAME
    
    # quiet: don't show log
    # sed -n: replace
    # //p: regex for nothing
    DURATION=$(ffprobe -i $INPUT -show_format -v quiet | sed -n 's/duration=//p')

    OUTPUT144=$OUTPUT-$DURATION-144
    OUTPUT360=$OUTPUT-$DURATION-360
    OUTPUT720=$OUTPUT-$DURATION-720

    echo 'rendering in 720p'
    
    # -y: overwrite
    ffmpeg -y -i $INPUT \
        -c:a aac -ac 2 \                                        # audio chanel
        -vcodec h264 -acodec aac \                              # codec 
        -ab 128k \                                              # average bitrate
        -movflags frag_keyframe+empty_moov+default_base_moof \  # flag
        -b:v 1500k \                                            # bitrate / download speed
        -maxrate 1500k \                                        # maxbitrate
        -bufsize 1000k \                                        # fragment at 1000k
        -vf "scale=-1:720" \                                    # value filter
        # -v quiet \
        $OUTPUT720.mp4

    echo 'rendering in 360p'
    ffmpeg -y -i $INPUT \
        -c:a aac -ac 2 \
        -vcodec h264 -acodec aac \
        -ab 128k \
        -movflags frag_keyframe+empty_moov+default_base_moof \
        -b:v 400k \
        -maxrate 400k \
        -bufsize 400k\
        -vf "scale=-1:360" \
        # -v quiet \
        $OUTPUT360.mp4

    echo 'rendering in 144p'
    ffmpeg -y -i $INPUT \
        -c:a aac -ac 2 \
        -vcodec h264 -acodec aac \
        -ab 128k \
        -movflags frag_keyframe+empty_moov+default_base_moof \
        -b:v 300k \
        -maxrate 300k \
        -bufsize 300k\
        -vf "scale=256:144" \
        # -v quiet \
        $OUTPUT144.mp4

    echo $OUTPUT144.mp4
    echo $OUTPUT360.mp4
    echo $OUTPUT720.mp4
done
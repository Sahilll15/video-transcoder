//download the video
const {S3Client,GetObjectCommand,PutObjectCommand}=require('@aws-sdk/client-s3')
require('dotenv').config();
const fs=require('node:fs/promises')
const fsnormal=require('fs')
const path=require('node:path')

const ffmpeg=require('fluent-ffmpeg')

const resolutions = [
    { name: "360p", width: 480, height: 360 },
    { name: "480p", width: 858, height: 480 },
    { name: "720p", width: 1280, height: 720 },
];
const s3client=new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_NEW,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_NEW 
    },
    region:process.env.AWS_REGION_ID,
})

const BUCKET_NAME=process.env.BUCKET_NAME;
const KEY=process.env.KEY;
const init=async()=>{

    //download the video
    const command=new GetObjectCommand({
        Bucket:BUCKET_NAME,
        Key:KEY
    })

        const result=await s3client.send(command);
        const originalFilePath='original-video.mp4'
        await fs.writeFile(originalFilePath,result.Body)


        const originalVideoPath=path.resolve(originalFilePath);


        //start the transcoder

       

        const promises=resolutions.map(resolution=>{
            const output=`video-${resolution.name}.mp4`

            return new Promise((resolve)=>{
                ffmpeg(originalVideoPath).output(output).
                withVideoCodec("libx264")
                .withAudioCodec("aac")
                .withSize(`${resolution.width}x${resolution.height}`)
                .on('end',async()=>{
                     //uplaod the video
                    const putCommand=new PutObjectCommand({
                        Bucket:process.env.AWS_FINAL_BUCKET,
                        Key:output,
                        Body:fsnormal.createReadStream(path.resolve(output))
                    })

                    await s3client.send(putCommand);

                    console.log('uploadeded ',output)
            
                    resolve(output);
                })
                .format('mp4')
                .run()
            })
            
        })

       

        await Promise.all(promises);


}

init()





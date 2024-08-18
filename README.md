# Video Transcoding Backend Service

This project serves as the backend for a robust video transcoding service. Built with Node.js and leveraging AWS technologies like S3, SQS, and ECS, it ensures seamless video processing and management. The service utilizes Docker containers for efficient deployment and scaling.

## Architecture Overview

![arch](https://github.com/user-attachments/assets/ef854f19-b539-46b2-827b-d042d6e2f3f1)


The service operates as follows:

1. **User Upload**: Users upload video files to an S3 bucket (temporary storage without transcoding).
2. **SQS Queue**: The upload triggers an SQS message to notify the system about the new file.
3. **Node.js Workers**: These workers poll the SQS queue, download the file, and validate its format.
4. **Dockerized FFmpeg**: The video is transcoded using FFmpeg within a Docker container.
5. **Upload to Final S3 Bucket**: The transcoded video is uploaded to a final S3 bucket.

## Technologies Used

- **Node.js**: For managing the backend processing.
- **AWS S3**: For storing original and transcoded video files.
- **AWS SQS**: To queue the tasks and ensure efficient handling.
- **AWS ECS**: To manage Docker containers and ensure scalable deployment.
- **Docker**: For containerizing the FFmpeg transcoding process.
- **FFmpeg**: For the actual transcoding of video files.



import { DeleteMessageCommand, ReceiveMessageCommand, SQSClient, SQSClientConfig } from '@aws-sdk/client-sqs';
import * as dotenv from 'dotenv';
import {S3Event} from 'aws-lambda'
import {ECS, ECSClient, RunTaskCommand,} from '@aws-sdk/client-ecs'


dotenv.config();

const client = new SQSClient({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_NEW as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_NEW as string
    },
    region:process.env.AWS_REGION_ID,
});


const ecsClient=new ECSClient({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_NEW as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_NEW as string
    },
    region:process.env.AWS_REGION_ID,
    
})


async function init(){
    const command=new ReceiveMessageCommand({
        QueueUrl:process.env.AWS_SQS_QUERY_URL,
        MaxNumberOfMessages:1,
        WaitTimeSeconds:20
    })

    while(true){
        const {Messages}=await client.send(command);

        if(!Messages){
            console.log('no messages');
            continue;
        }else{
            try {
                for(const message of Messages){
                    const {MessageId,Body}=message;
    
                    console.log('Mesage received ',{MessageId,Body});
                    //validate and parse the event
                    if(!Body) continue;
    
                    const event=JSON.parse(Body) as S3Event;

                   if("Service" in event && "Event" in event){
                     if(event.Event ==="s3:TestEvent") {
                        await client.send(new DeleteMessageCommand({
                            QueueUrl:process.env.AWS_SQS_QUERY_URL,
                            ReceiptHandle:message.ReceiptHandle
                        }))
                     }
                     continue;
                   }
    
                  

                    for(const record of event.Records){
                        const {eventName,s3}=record;
                        const {bucket,object:{key}}=s3;

                        //spin up the docker container

                        const runTaskCommand=new RunTaskCommand({
                            taskDefinition:process.env.AWS_TASK_DEFINITION_ARN,
                            cluster:process.env.AWS_CLUSTER_ARN,
                            launchType:"FARGATE",
                            networkConfiguration:{
                                awsvpcConfiguration:{
                                    assignPublicIp:"ENABLED",
                                    securityGroups:[''],
                                    subnets:[
                                  
                                    ]
                                },
                                
                            },
                            overrides:{
                                containerOverrides:[{
                                    name:"video-trasncoder",
                                    environment:[{
                                        name:"BUCKET_NAME",
                                        value:bucket.name
                                    },{
                                        name:"KEY",
                                        value:key
                                    }]
                                }]
                            }
                        })


                        await ecsClient.send(runTaskCommand);

                            //delete the message from the queue 
                        await client.send(new DeleteMessageCommand({
                            QueueUrl:process.env.AWS_SQS_QUERY_URL,
                            ReceiptHandle:message.ReceiptHandle
                        }))
                    }
                }
            } catch (error) {
                    console.log(error)
            }
        }
    }
}


init();
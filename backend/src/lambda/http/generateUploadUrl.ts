import 'source-map-support/register'
import * as uuid from 'uuid'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { DB } from '../../utils/db'
// import { S3 } from '../../utils/s3'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const db = new DB()
// const s3 = new S3()
const logger = createLogger('auth')
const IMAGE_BUCKET = process.env.IMAGE_BUCKET;

// test
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    logger.info(`generateUploadUrl todoId : ${todoId}`)
    const valid = await db.todoIsExists(todoId)

    if (!valid) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                error: 'Todo Item does not exist'
            })
        }
    }

    const imageId = uuid.v4()
    // const image = await db.createImage(todoId, imageId)
    await db.updateTodoItemAttachmentUrl(todoId, `https://${IMAGE_BUCKET}.s3.amazonaws.com/${imageId}`)

    const uploadUrl = getUploadUrl(imageId)
    logger.info(`generateUploadUrl uploadUrl : ${uploadUrl}`)

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            uploadUrl
        })
    }
})

handler.use(
    cors({
        credentials: true
    })
)

function getUploadUrl(imageId: string) {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: imageId,
        Expires: urlExpiration
    })
}
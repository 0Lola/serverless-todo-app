import { ImageItem } from './../../models/ImageItem';
import 'source-map-support/register'
import * as uuid from 'uuid'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { DB } from '../../utils/db'
import { S3 } from '../../utils/s3'

const db = new DB()
const s3 = new S3()
const logger = createLogger('auth')

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
    const image = await db.createImage(todoId, imageId)
    await db.updateTodoItemAttachmentUrl(todoId,image.imageUrl)

    const imageItem = s3.getUploadImageItem(imageId)
    logger.info(`generateUploadUrl uploadUrl : ${JSON.stringify(imageItem.uploadUrl)}`)

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body:JSON.stringify({
            uploadUrl: imageItem.uploadUrl
        })
    }
})

handler.use(
    cors({
        credentials: true
    })
)

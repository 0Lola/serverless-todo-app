import 'source-map-support/register'
import * as uuid from 'uuid'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { DB } from '../../utils/db'
import { S3 } from '../../utils/s3'
import { parseUserId } from '../../auth/utils'

const db = new DB()
const s3 = new S3()
const IMAGE_BUCKET = process.env.IMAGE_BUCKET

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
    
    const split = event.headers.Authorization.split(' ')
    const token = split[1]
    const userId = parseUserId(token)
    const imageId = uuid.v4()
    await db.updateTodoItemAttachmentUrl(userId,todoId, `https://${IMAGE_BUCKET}.s3.amazonaws.com/${imageId}`)

    const uploadUrl = s3.getUploadUrl(imageId)
    logger.info(`generateUploadUrl uploadUrl : ${uploadUrl}`)

    return {
        statusCode: 201,
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


import 'source-map-support/register'
import * as uuid from 'uuid'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { parseUserId } from '../../auth/utils'
import { todoIsExists, updateTodoItemAttachmentUrl } from '../../businessLogic/todo'
import { getUploadUrl } from '../../businessLogic/image'

const logger = createLogger('auth')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const split = event.headers.Authorization.split(' ')
    const token = split[1]
    const userId = parseUserId(token)
    const todoId = event.pathParameters.todoId
    logger.info(`generateUploadUrl todoId : ${todoId}`)
    const valid = await todoIsExists(userId,todoId)

    if (!valid) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                error: 'Todo Item does not exist'
            })
        }
    }
    
    const imageId = uuid.v4()
    await updateTodoItemAttachmentUrl(userId,todoId,imageId)
    logger.info(`attachmentUrl imageId : ${imageId}`)

    const uploadUrl = getUploadUrl(imageId)
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


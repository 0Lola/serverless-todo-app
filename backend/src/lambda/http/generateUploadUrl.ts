import 'source-map-support/register'
import * as uuid from 'uuid'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DB } from '../../utils/db'
import { S3 } from '../../utils/s3'

const db = new DB()
const s3 = new S3()

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    console.log(`generateUploadUrl todoId : ${todoId}`)
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
    console.log(`generateUploadUrl imageId : ${imageId}`)
    const image = await db.createImage(todoId, imageId, event)

    console.log(`createImage succeed : ${image.imageId}`)

    const imageItem = await s3.getUploadImageItem(imageId)
    console.log(`generateUploadUrl uploadUrl : ${JSON.stringify(imageItem.uploadUrl)}`)

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body:JSON.stringify({
            ...imageItem
        })
    }
})

handler.use(
    cors({
        credentials: true
    })
)

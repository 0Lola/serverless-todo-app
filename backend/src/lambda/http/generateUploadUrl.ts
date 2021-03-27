import 'source-map-support/register'
import * as AWSXRay from 'aws-xray-sdk'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
// import * as middy from 'middy'
// import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { DB } from '../../utils/db'

const db = new DB()
const IMAGE_BUCKET = process.env.IMAGE_BUCKET
// const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

export const handler : APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todId
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

    const url = getUploadUrl(imageId)

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            image: image,
            uploadUrl: url
        })
    }
}


function getUploadUrl(imageId: string) {
    return s3.getSignedUrl('putObject', {
      Bucket: IMAGE_BUCKET,
      Key: imageId,
    //   Expires: urlExpiration
    })
  }

import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { ImageItem } from '../models/ImageItem'

const IMAGE_BUCKET = process.env.IMAGE_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})


export class S3 {

    constructor() { }

    async getUploadImageItem(imageId: string): Promise<ImageItem> {
        const imageItem = await  s3.getSignedUrl('putObject', {
            Bucket: IMAGE_BUCKET,
            Key: imageId,
            Expires: urlExpiration
        }).promise()

        return imageItem as ImageItem;
    }

}

import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const IMAGE_BUCKET = process.env.IMAGE_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

export class ImageAccess {

    constructor() { }

    getUploadUrl(imageId: string) {
        return s3.getSignedUrl('putObject', {
            Bucket: IMAGE_BUCKET,
            Key: imageId,
            Expires: urlExpiration
        })
    }

    getEKSUploadUrl(imageId: string) {
        return s3.getSignedUrl('putObject', {
            Bucket: 'udacity-image-bucket-zxa011023',
            Key: imageId,
            Expires: urlExpiration
        })
    }

}

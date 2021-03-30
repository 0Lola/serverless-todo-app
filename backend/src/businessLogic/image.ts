import { ImageAccess } from './../dataLayer/imageAccess';

const imageAccess = new ImageAccess()

export async function getUploadUrl(imageId: string): Promise<string> {
    return imageAccess.getUploadUrl(imageId)
}

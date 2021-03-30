import { ImageAccess } from './../dataLayer/imageAccess';

const imageAccess = new ImageAccess()

export function getUploadUrl(imageId: string): string {
    return imageAccess.getUploadUrl(imageId)
}

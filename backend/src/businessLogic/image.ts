import { ImageAccess } from './../dataLayer/imageAccess';
import { TodoItem } from '../models/TodoItem';

const imageAccess = new ImageAccess()

export async function getUploadUrl(imageId: string): Promise<TodoItem[]> {
    return imageAccess.getUploadUrl(imageId)
}

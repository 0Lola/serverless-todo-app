import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { TodoAccess } from '../dataLayer/todoAccess';

const todoAccess = new TodoAccess()

export async function getAllTodoItemsByToken(jwtToken: string): Promise<TodoItem[]> {
    return todoAccess.getAllTodoItemsByToken(jwtToken);
}

export async function createTodoItem(userId:string,item: CreateTodoRequest): Promise<TodoItem> {
    const date = new Date()
    return todoAccess.createTodoItem({
        userId,
        todoId: uuid.v4(),
        createdAt: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`,
        name: item.name,
        dueDate: item.dueDate,
        done: false
        })
}

export async function updateTodoItem(userId: string, todoId: string, item: UpdateTodoRequest): Promise<any> {
  return await todoAccess.updateTodoItem(userId,todoId,item)
}

export async function updateTodoItemAttachmentUrl(userId: string, todoId: string, imageId: string): Promise<string> {
    return await todoAccess.updateTodoItemAttachmentUrl(userId,todoId,imageId)
}

export async function deleteTodoItem(userId: string, todoId: string): Promise<string> {
    return await todoAccess.deleteTodoItem(userId,todoId)
}

export async function todoIsExists(userId: string, todoId: string): Promise<boolean> {
    return await todoAccess.todoIsExists(userId,todoId)
}

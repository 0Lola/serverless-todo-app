import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { DB } from '../../utils/db'
import { TodoItem } from '../../models/TodoItem'

const db = new DB()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const todo: UpdateTodoRequest = JSON.parse(event.body)

    const result = await update(todoId,todo)
    
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            // 'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            result
        })
    }
}

export async function update(
    todoId: string,
    body: UpdateTodoRequest,
    // jwtToken?: string
): Promise<TodoItem> {

    return await db.updateTodoItem(todoId,body)
}
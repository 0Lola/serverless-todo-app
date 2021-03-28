import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { DB } from '../../utils/db';

const db = new DB();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
    const result = await deleteTodo(todoId,jwtToken)

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            result
        })
    }
}

export async function deleteTodo(
    todoId: string,
    jwtToken?: string
): Promise<string> {

    return await db.deleteTodoItem(todoId)
}


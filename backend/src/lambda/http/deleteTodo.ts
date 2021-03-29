import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { DB } from '../../utils/db';
import { createLogger } from '../../utils/logger'

const db = new DB();
const logger = createLogger('auth')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const item = await deleteTodo(todoId)

    logger.info(`deleteTodo : ${todoId}`);

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            item
        })
    }
}

export async function deleteTodo(
    todoId: string
): Promise<string> {

    return await db.deleteTodoItem(todoId)
}


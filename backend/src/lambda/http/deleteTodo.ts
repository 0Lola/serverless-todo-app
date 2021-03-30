import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { DB } from '../../utils/db';
import { createLogger } from '../../utils/logger'
import { parseUserId } from '../../auth/utils';

const db = new DB();
const logger = createLogger('auth')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const split = event.headers.Authorization.split(' ')
    const token = split[1]
    const userId = parseUserId(token)
    const item = await db.deleteTodoItem(todoId,userId)

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

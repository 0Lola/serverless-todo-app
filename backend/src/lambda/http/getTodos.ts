import { TodoItem } from './../../models/TodoItem';
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import { parseUserId } from '../../auth/utils';
import { createLogger } from '../../utils/logger'
import { getAllTodoItemsByToken } from '../../businessLogic/todo';

const logger = createLogger('auth')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const split = event.headers.Authorization.split(' ')
    const token = split[1]
    const userId = parseUserId(token)
    logger.info(`getTodos by token:${JSON.stringify(event)}`)

    const items = await getAllTodoItemsByToken(userId) as TodoItem[]

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            items
        })
    }

}

import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { DB } from '../../utils/db'
import { createLogger } from '../../utils/logger'
import { parseUserId } from '../../auth/utils'

const db = new DB();
const logger = createLogger('auth')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const todo: UpdateTodoRequest = JSON.parse(event.body)
    const split = event.headers.Authorization.split(' ')
    const token = split[1]
    const userId = parseUserId(token)
    const item = await db.updateTodoItem(userId,todoId,todo)
    
    logger.info(`updateTodo :${JSON.stringify(item)}`)

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

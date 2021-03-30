import { DB } from './../../utils/db';
import * as uuid from 'uuid'
import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { TodoItem } from './../../models/TodoItem';
import { parseUserId } from '../../auth/utils';
import { createLogger } from '../../utils/logger'

const db = new DB();
const logger = createLogger('auth')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    logger.info(`createTodo : ${JSON.stringify(event)}`);

    const todo: CreateTodoRequest = JSON.parse(event.body)
    const split = event.headers.Authorization.split(' ')
    const token = split[1]
    const userId = parseUserId(token)
    const item = await create(todo,userId)

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

export async function create(
    body: CreateTodoRequest,
    jwtToken: string
): Promise<TodoItem> {

    const date = new Date()
    return await db.createTodoItem({
        userId: jwtToken,
        todoId: uuid.v4(),
        createdAt: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`,
        name: body.name,
        dueDate: body.dueDate,
        done: false
    })
}


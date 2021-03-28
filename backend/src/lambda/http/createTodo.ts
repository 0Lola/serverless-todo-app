import { DB } from './../../utils/db';
import * as uuid from 'uuid'
import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { TodoItem } from './../../models/TodoItem';
import { verifyToken } from '../auth/auth0Authorizer';

const db = new DB();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    console.log(`createTodo : ${JSON.stringify(event)}`);

    const todo: CreateTodoRequest = JSON.parse(event.body)
    const jwtToken = await verifyToken(event.headers.Authorization)
    const item = await create(todo,jwtToken.sub)

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


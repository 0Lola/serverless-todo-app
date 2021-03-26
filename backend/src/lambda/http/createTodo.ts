import { DB } from './../../utils/db';
import * as uuid from 'uuid'
import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { TodoItem } from './../../models/TodoItem';

const db = new DB();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    console.log(`createTodo : ${JSON.stringify(event)}`);

    const todo: CreateTodoRequest = JSON.parse(event.body)
    const result = await create(todo)

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

export async function create(
    body: CreateTodoRequest,
    jwtToken?: string
): Promise<TodoItem> {

    return await db.createTodoItem({
        userId:  jwtToken,
        todoId: uuid.v4(),
        createdAt: new Date().toISOString(),
        name: body.name,
        dueDate: body.dueDate,
        done: false
    })
}


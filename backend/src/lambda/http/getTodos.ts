import { TodoItem } from './../../models/TodoItem';
import { DB } from './../../utils/db';
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import { verifyToken } from '../auth/auth0Authorizer';

const db = new DB();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const jwtToken = await verifyToken(event.headers.Authorization)
    console.log(`getTodos by token:${JSON.stringify(event)}`)

    const items = await db.getAllTodoItemsByToken(jwtToken.sub) as TodoItem[]

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

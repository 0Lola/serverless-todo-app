import { TodoItem } from './../models/TodoItem';
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)
const ITEMS_TABLE = process.env.ITEMS_TABLE;

export class DB {

    constructor(
        private readonly db: DocumentClient = createDynamoDBClient()) {
    }

    async getAllTodoItems(): Promise<TodoItem[]> {

        console.log('getAllTodoItems');
        const result = await this.db.scan({
            TableName: ITEMS_TABLE
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodoItem(item: TodoItem): Promise<TodoItem> {
        await this.db.put({
            TableName: ITEMS_TABLE,
            Item: item
        }).promise()

        return item
    }
}

// offline
function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        console.log('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}

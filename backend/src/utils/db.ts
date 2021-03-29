import { UpdateTodoRequest } from './../../../client/src/types/UpdateTodoRequest';
import { TodoItem } from './../models/TodoItem';
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)
const TODO_TABLE = process.env.TODO_TABLE;
const IMAGE_TABLE = process.env.IMAGE_TABLE;
const IMAGE_BUCKET = process.env.IMAGE_BUCKET;
const USER_ID_INDEX = process.env.USER_ID_INDEX;

export class DB {

    constructor(
        private readonly db: DocumentClient = createDynamoDBClient()) {
    }

    // Todo

    async getAllTodoItems(): Promise<TodoItem[]> {
        const result = await this.db.scan({
            TableName: TODO_TABLE
        }).promise()
        const items = result.Items
        console.log(`getAllTodoItems response: ${items}`)
        return items as TodoItem[]
    }

    async getAllTodoItemsByToken(jwtToken: string): Promise<TodoItem[]> {

        const result = await this.db.query({
            TableName: TODO_TABLE,
            IndexName: USER_ID_INDEX,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': jwtToken
            }
        }).promise()

        if (result.Count === 0)
            return []

        const items = result.Items
        console.log(`getAllTodoItemsByToken response: ${items}`)
        return items as TodoItem[]
    }

    async createTodoItem(item: TodoItem): Promise<TodoItem> {
        await this.db.put({
            TableName: TODO_TABLE,
            Item: item
        }).promise()

        console.log(`createTodoItem response: ${item}`)

        return item
    }

    async updateTodoItem(todoId: string, item: UpdateTodoRequest): Promise<any> {
        const newTodo = await this.db.update({
            TableName: TODO_TABLE,
            Key: {
                todoId: todoId
            },
            UpdateExpression: 'SET #n = :name, #dd = :dueDate, #d = :done',
            ConditionExpression: '#t = :todoId',
            ExpressionAttributeValues: {
                ':todoId': todoId,
                ':name': item.name,
                ':dueDate': item.dueDate,
                ':done': item.done,
            },
            ExpressionAttributeNames:{
                '#n': 'name',
                '#dd': 'dueDate',
                '#d': 'done',
                '#t': 'todoId',
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()

        console.log(`updateTodoItem response: ${newTodo}`)

        return newTodo
    }

    async updateTodoItemAttachmentUrl(todoId: string, attachmentUrl: string): Promise<any> {

        const newTodo = await this.db.update({
            TableName: TODO_TABLE,
            Key: {
                todoId: todoId
            },
            UpdateExpression: 'SET #a = :attachmentUrl',
            ConditionExpression: '#t = :todoId',
            ExpressionAttributeValues: {
                ':todoId': todoId,
                ':attachmentUrl': attachmentUrl,
            },
            ExpressionAttributeNames:{
                '#a': 'attachmentUrl',
                '#t': 'todoId'
            },
            ReturnValues: "UPDATED_NEW"
        }).promise();

        console.log(`updateTodoItemAttachmentUrl response: ${newTodo}`)

        return newTodo;
    }

    async deleteTodoItem(todoId: string): Promise<string> {
        await this.db.delete({
            TableName: TODO_TABLE,
            Key: {
                todoId: todoId
            }
        }).promise()

        console.log(`deleteTodoItem response: ${todoId}`)
        return todoId
    }

    async todoIsExists(todoId: string): Promise<boolean> {
        const result = await this.db.get({
            TableName: TODO_TABLE,
            Key: {
                todoId: todoId
            }
        }).promise()

        const item = result.Item
        const isExist = item != null && item != undefined
        console.log(`todoIsExists response: ${isExist}`)
        return isExist
    }

    // Image

    async createImage(id: string, imageId: string): Promise<any> {
        const timestamp = new Date().toISOString()

        const image = {
            id,
            timestamp,
            imageId,
            imageUrl: `https://${IMAGE_BUCKET}.s3.amazonaws.com/${imageId}`
        }

        const newImage = await this.db
            .put({
                TableName: IMAGE_TABLE,
                Item: image
            }).promise()
        console.log(`createImage response: ${JSON.stringify(newImage)}`)

        return newImage
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

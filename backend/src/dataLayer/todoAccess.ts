import { UpdateTodoRequest } from '../../../client/src/types/UpdateTodoRequest';
import { TodoItem } from '../models/TodoItem';
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)
const TODO_TABLE = process.env.TODO_TABLE;
const USER_ID_INDEX = process.env.USER_ID_INDEX;
const IMAGE_BUCKET = process.env.IMAGE_BUCKET

export class TodoAccess {

    constructor(
        private readonly db: DocumentClient = createDynamoDBClient()) {
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

    async updateTodoItem(userId: string, todoId: string, item: UpdateTodoRequest): Promise<any> {
        const newTodo = await this.db.update({
            TableName: TODO_TABLE,
            Key: {
                todoId: todoId,
                userId: userId
            },
            UpdateExpression: 'SET #n = :name, #dd = :dueDate, #d = :done',
            ConditionExpression: '#t = :todoId AND #u = :userId',
            ExpressionAttributeValues: {
                ':todoId': todoId,
                ':userId': userId,
                ':name': item.name,
                ':dueDate': item.dueDate,
                ':done': item.done
            },
            ExpressionAttributeNames: {
                '#t': 'todoId',
                '#u': 'userId',
                '#n': 'name',
                '#dd': 'dueDate',
                '#d': 'done',
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()

        console.log(`updateTodoItem response: ${newTodo}`)

        return newTodo
    }

    async updateTodoItemAttachmentUrl(userId: string, todoId: string, imageId: string): Promise<any> {

        const attachmentUrl = `https://${IMAGE_BUCKET}.s3.amazonaws.com/${imageId}`
        const newTodo = await this.db.update({
            TableName: TODO_TABLE,
            Key: {
                todoId: todoId,
                userId: userId
            },
            UpdateExpression: 'SET #a = :attachmentUrl',
            ConditionExpression: '#t = :todoId AND #u =:userId',
            ExpressionAttributeValues: {
                ':todoId': todoId,
                ':userId': userId,
                ':attachmentUrl': attachmentUrl,
            },
            ExpressionAttributeNames: {
                '#t': 'todoId',
                '#u': 'userId',
                '#a': 'attachmentUrl'
            },
            ReturnValues: "UPDATED_NEW"
        }).promise();

        console.log(`updateTodoItemAttachmentUrl response: ${JSON.stringify(newTodo)}`)

        return imageId
    }

    async deleteTodoItem(userId:string,todoId: string): Promise<string> {
        await this.db.delete({
            TableName: TODO_TABLE,
            Key: {
                todoId: todoId,
                userId: userId
            }
        }).promise()

        console.log(`deleteTodoItem response: ${todoId}`)
        return todoId
    }

    async todoIsExists(userId: string, todoId: string): Promise<boolean> {
        const result = await this.db.get({
            TableName: TODO_TABLE,
            Key: {
                todoId: todoId,
                userId: userId
            }
        }).promise()

        const item = result.Item
        const isExist = item != null && item != undefined
        console.log(`todoIsExists response: ${isExist}`)
        return isExist
    }

}

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

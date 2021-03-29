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

    // Todo Item

    async getAllTodoItems(): Promise<TodoItem[]> {

        console.log('getAllTodoItems');
        const result = await this.db.scan({
            TableName: TODO_TABLE
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async getAllTodoItemsByToken(jwtToken: string): Promise<TodoItem[]> {

        console.log(`getAllTodoItemsByToken: ${jwtToken}`);


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
        return items as TodoItem[]
    }
    async createTodoItem(item: TodoItem): Promise<TodoItem> {
        await this.db.put({
            TableName: TODO_TABLE,
            Item: item
        }).promise()

        return item
    }

    async updateTodoItem(todoId: string, item: UpdateTodoRequest): Promise<any> {
        await this.db.update({
            TableName: TODO_TABLE,
            Key: {
                todoId: todoId
            },
            UpdateExpression: "SET #n = :name, #dd = :dueDate, #d = :done",
            ConditionExpression: "#t = :todoId",
            ExpressionAttributeValues: {
                ":todoId": todoId,
                ":name": item.name,
                ":dueDate": item.dueDate,
                ":done": item.done
            },
            ExpressionAttributeNames:{
                "#n": "name",
                "#dd": "dueDate",
                "#d": "done",
                "#t": "todo"
            },
            ReturnValues: "UPDATED_NEW"
        },
            (err, res) => {
                if (err) {
                    console.error(`updateTodo error: ${JSON.stringify(err)}`);
                    return err;

                }
                if (res) {
                    console.log(`updateTodo succeeded: ${JSON.stringify(res)}`);
                    return res;
                }

            }).promise()

    }

    async deleteTodoItem(todoId: string): Promise<string> {
        await this.db.delete({
            TableName: TODO_TABLE,
            Key: {
                todoId: todoId
            }
        }).promise()

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
        console.log(`todoIsExists: ${JSON.stringify(item)}`);
        return item != null && item != undefined
    }

    // Image

    async createImage(id: string, imageId: string, event: any) {
        const timestamp = new Date().toISOString()
        const attachment = event.body

        const image = {
            id,
            timestamp,
            imageId,
            attachment,
            imageUrl: `https://${IMAGE_BUCKET}.s3.amazonaws.com/${imageId}`
        }

        await this.db
            .put({
                TableName: IMAGE_TABLE,
                Item: image
            })
            .promise()

        return image
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

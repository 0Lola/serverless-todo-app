import { UpdateTodoRequest } from './../../../client/src/types/UpdateTodoRequest';
import { TodoItem } from './../models/TodoItem';
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)
const ITEM_TABLE = process.env.ITEM_TABLE;
const IMAGE_TABLE = process.env.IMAGE_TABLE;
const IMAGES_BUCKET = process.env.IMAGES_BUCKET;

export class DB {

    constructor(
        private readonly db: DocumentClient = createDynamoDBClient()) {
    }

    // Todo Item

    async getAllTodoItems(): Promise<TodoItem[]> {

        console.log('getAllTodoItems');
        const result = await this.db.scan({
            TableName: ITEM_TABLE
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodoItem(item: TodoItem): Promise<TodoItem> {
        await this.db.put({
            TableName: ITEM_TABLE,
            Item: item
        }).promise()

        return item
    }

    async updateTodoItem(todoId:string ,item: UpdateTodoRequest): Promise<any> {
        await this.db.update({
            TableName: ITEM_TABLE,
            Key: {
                todoId: todoId
            },
            UpdateExpression: "SET name = :name, dueDate = :dueDate, done = :done",
                ConditionExpression: "todoId = :todoId",
                ExpressionAttributeValues: {
                    ":todoId": todoId,
                    ":name": item.name,
                    ":dueDate": item.dueDate,
                    ":done": item.done,
                },
            ReturnValues:"UPDATED_NEW"
        },
        (err,res)=>{
            if(err){
                console.error(`updateTodo error: ${JSON.stringify(err)}`);
                return err;

            }
            if(res){
                console.log(`updateTodo succeeded: ${JSON.stringify(res)}`);
                return res;
            }
            
        }).promise()

    }

    async deleteTodoItem(todoId:string): Promise<string>{
        await this.db.delete({
            TableName: ITEM_TABLE,
            Key: {
                todoId: todoId
            }
        }).promise()

        return todoId
    }
    
    async todoIsExists(todoId:string): Promise<TodoItem> {
        console.log('getAllTodoItems');
        const result = await this.db.get({
            TableName: ITEM_TABLE,
            Key: {
                todoId: todoId
            }
        }).promise()

        const item = result.Item
        return item as TodoItem
    }

    // Image

    async createImage(id: string, imageId: string, event: any) {
        const timestamp = new Date().toISOString()
        const attachment = JSON.parse(event.body)
      
        const image = {
          id,
          timestamp,
          imageId,
          ...attachment,
          imageUrl: `https://${IMAGES_BUCKET}.s3.amazonaws.com/${imageId}`
        }
        console.log('createImage :', attachment)
      
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

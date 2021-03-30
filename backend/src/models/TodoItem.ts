export interface TodoItem {
    userId: string
    todoId: string
    createdAt: string
    name: string
    dueDate: string
    done: boolean
    timestamp: string
    attachmentUrl?: string
}

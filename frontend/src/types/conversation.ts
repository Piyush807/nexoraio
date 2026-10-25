export type MessageRole = 'USER' | 'ASSISTANT'

export interface CreateConversationRequest { goalId?: string | null; title: string }
export interface ConversationResponse {
  id: string
  goalId: string | null
  title: string
  createdAt: string
  updatedAt: string
}
export interface CreateMessageRequest { content: string }
export interface MessageResponse {
  id: string
  role: MessageRole
  content: string
  createdAt: string
}

import { apiClient } from './client'
import type {
  ConversationResponse,
  CreateConversationRequest,
  CreateMessageRequest,
  MessageResponse,
} from '../types/conversation'

export const conversationsApi = {
  create: async (payload: CreateConversationRequest): Promise<ConversationResponse> => {
    const res = await apiClient.post<ConversationResponse>('/api/v1/conversations', payload)
    return res.data
  },
  list: async (): Promise<ConversationResponse[]> => {
    const res = await apiClient.get<ConversationResponse[]>('/api/v1/conversations')
    return res.data
  },
  getById: async (conversationId: string): Promise<ConversationResponse> => {
    const res = await apiClient.get<ConversationResponse>(`/api/v1/conversations/${conversationId}`)
    return res.data
  },
  remove: async (conversationId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/conversations/${conversationId}`)
  },
  sendMessage: async (conversationId: string, payload: CreateMessageRequest): Promise<MessageResponse> => {
    const res = await apiClient.post<MessageResponse>(
      `/api/v1/conversations/${conversationId}/messages`,
      payload,
    )
    return res.data
  },
  getMessages: async (conversationId: string): Promise<MessageResponse[]> => {
    const res = await apiClient.get<MessageResponse[]>(`/api/v1/conversations/${conversationId}/messages`)
    return res.data
  },
}

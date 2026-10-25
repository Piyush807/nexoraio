import { apiClient } from './client'
import { cachedGet, invalidateCache } from './cache'
import type {
  ConversationResponse,
  CreateConversationRequest,
  CreateMessageRequest,
  MessageResponse,
} from '../types/conversation'

export const conversationsApi = {
  create: async (payload: CreateConversationRequest): Promise<ConversationResponse> => {
    const res = await apiClient.post<ConversationResponse>('/api/v1/conversations', payload)
    invalidateCache('conversations:')
    invalidateCache('memory:')
    return res.data
  },
  list: async (): Promise<ConversationResponse[]> => {
    return cachedGet('conversations:list', async () => {
      const res = await apiClient.get<ConversationResponse[]>('/api/v1/conversations')
      return res.data
    }, 30_000)
  },
  getById: async (conversationId: string): Promise<ConversationResponse> => {
    return cachedGet(`conversations:${conversationId}`, async () => {
      const res = await apiClient.get<ConversationResponse>(`/api/v1/conversations/${conversationId}`)
      return res.data
    }, 30_000)
  },
  remove: async (conversationId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/conversations/${conversationId}`)
    invalidateCache('conversations:')
    invalidateCache('memory:')
  },
  sendMessage: async (conversationId: string, payload: CreateMessageRequest): Promise<MessageResponse> => {
    const res = await apiClient.post<MessageResponse>(`/api/v1/conversations/${conversationId}/messages`, payload)
    invalidateCache(`conversations:messages:${conversationId}`)
    invalidateCache(`conversations:${conversationId}`)
    invalidateCache('conversations:list')
    invalidateCache('memory:')
    return res.data
  },
  getMessages: async (conversationId: string): Promise<MessageResponse[]> => {
    return cachedGet(`conversations:messages:${conversationId}`, async () => {
      const res = await apiClient.get<MessageResponse[]>(`/api/v1/conversations/${conversationId}/messages`)
      return res.data
    }, 15_000)
  },
}

package io.nexora.backend.ai.service;

import io.nexora.backend.ai.dto.request.ChatRequest;
import io.nexora.backend.ai.dto.response.ChatResponse;
import io.nexora.backend.conversation.entity.Message;

import java.util.List;
public interface AIService {

    ChatResponse chat(ChatRequest request);

}
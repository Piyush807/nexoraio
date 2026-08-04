package io.nexora.backend.ai.service;

import io.nexora.backend.ai.dto.request.ChatRequest;
import io.nexora.backend.ai.dto.response.ChatResponse;

public interface AIService {

    ChatResponse chat(ChatRequest request);

}

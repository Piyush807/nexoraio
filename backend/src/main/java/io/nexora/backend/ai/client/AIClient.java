package io.nexora.backend.ai.client;

import io.nexora.backend.ai.dto.RoadmapGenerationResponse;
import io.nexora.backend.goal.entity.Goal;
public interface AIClient {

    <T> T generate(String prompt, Class<T> responseType);

}

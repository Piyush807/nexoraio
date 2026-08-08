package io.nexora.backend.ai.client;

public interface AIClient {

    <T> T generate(String prompt, Class<T> responseType);

}

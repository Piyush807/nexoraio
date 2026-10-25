package io.nexora.backend.progress.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CreateProgressTaskRequest {
    @NotBlank @Size(max=500) private String milestoneTitle;
    @NotBlank @Size(max=1000) private String taskTitle;
}
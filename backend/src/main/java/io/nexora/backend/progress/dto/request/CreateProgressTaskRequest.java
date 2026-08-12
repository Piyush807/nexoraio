package io.nexora.backend.progress.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProgressTaskRequest {

    private String milestoneTitle;
    private String taskTitle;
}

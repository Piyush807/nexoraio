package io.nexora.backend.roadmap.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SetMilestoneCompletionRequest {

    @NotNull(message = "completed is required")
    private Boolean completed;
}

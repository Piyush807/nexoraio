package io.nexora.backend.workspace.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateWorkspaceRequest {
    @NotBlank
    private String name;
    private String description;
}

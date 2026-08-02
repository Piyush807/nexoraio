package io.nexora.backend.project.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateProjectRequest {
    @NotBlank
    private String  name;
    private String  description;
}

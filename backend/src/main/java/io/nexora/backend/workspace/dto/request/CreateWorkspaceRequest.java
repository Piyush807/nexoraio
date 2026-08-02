package io.nexora.backend.workspace.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@RequiredArgsConstructor
@Builder
@AllArgsConstructor
public class CreateWorkspaceRequest {
   @NotBlank
   private String  name;
   private String  description;
}

package io.nexora.backend.workspace.dto.request;

import lombok.*;

@Getter
@Setter
@RequiredArgsConstructor
@Builder
@AllArgsConstructor
public class CreateWorkspaceRequest {
   private String  name;
   private String  description;
}

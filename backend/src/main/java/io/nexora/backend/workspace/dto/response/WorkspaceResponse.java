package io.nexora.backend.workspace.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;
@Getter
@Setter
@RequiredArgsConstructor
@Builder
@AllArgsConstructor
public class WorkspaceResponse {
   private UUID id;
   private String name;
   private String description;
   private String ownerEmail;
   private LocalDateTime createdAt;

}

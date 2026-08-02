package io.nexora.backend.project.entity;

import io.nexora.backend.project.enums.ProjectStatus;
import io.nexora.backend.workspace.entity.Workspace;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;
    private String description;

    @Enumerated(EnumType.STRING)
    private ProjectStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @Builder.Default
    private boolean deleted = false;

    private Instant createdAt;
    private Instant updatedAt;
}

package io.nexora.backend.task.entity;

import io.nexora.backend.project.entity.Project;
import io.nexora.backend.task.eums.TaskPriority;
import io.nexora.backend.task.eums.TaskStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Task {
    @Id
    @GeneratedValue
    private UUID id;
    @Column(nullable = false)
    private String title;
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id",nullable = false)
    private Project project;

    @Enumerated(EnumType.STRING)
    private TaskStatus status;

    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    private TaskPriority priority;

    private Instant createdAt;
    private Instant updatedAt;
    @Builder.Default
    private boolean deleted= false;
}

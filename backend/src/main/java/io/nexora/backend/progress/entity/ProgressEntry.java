package io.nexora.backend.progress.entity;

import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.goal.entity.Goal;
import io.nexora.backend.roadmap.entity.Roadmap;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressEntry {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id", nullable = false)
    private Goal goal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private Roadmap roadmap;

    @Column(nullable = false)
    private LocalDate entryDate;

    @Column(columnDefinition = "TEXT")
    private String note;

    private Integer completedMilestones;

    private Integer completedTasks;

    private Integer growthScore;

    private Instant createdAt;

    private Instant updatedAt;
}

package io.nexora.backend.roadmap.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Milestone {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private Roadmap roadmap;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer orderIndex;

    private Integer estimatedDays;

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "roadmap_milestone_tasks", joinColumns = @JoinColumn(name = "milestone_id"))
    @OrderColumn(name = "task_order")
    @Column(name = "task", columnDefinition = "TEXT")
    private List<String> tasks = new ArrayList<>();

    @Builder.Default
    private boolean completed = false;
}

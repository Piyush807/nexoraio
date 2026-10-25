package io.nexora.backend.progress.entity;

import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.conversation.entity.Conversation;
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
@Table(uniqueConstraints = @UniqueConstraint(name = "uk_daily_coach_goal_date", columnNames = {"goal_id", "coachDate"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyCoachEntry {

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    @Column(nullable = false)
    private LocalDate coachDate;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String reply;

    private Instant createdAt;
}

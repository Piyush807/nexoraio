package io.nexora.backend.goal.entity;

import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.goal.enums.CurrentLevel;
import io.nexora.backend.goal.enums.GoalStatus;
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
public class Goal {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String title;
    private String description;
    @Enumerated(EnumType.STRING)
    private CurrentLevel currentLevel;

    @Enumerated(EnumType.STRING)
    private GoalStatus status;

   private LocalDate targetDate;
   private Integer dailyStudyHours;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    Account account;

   private Instant createdAt;
   private Instant updatedAt;

    private boolean deleted;

}

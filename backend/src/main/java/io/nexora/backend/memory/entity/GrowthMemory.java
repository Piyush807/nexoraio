package io.nexora.backend.memory.entity;

import io.nexora.backend.auth.entity.Account;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "growth_memory", uniqueConstraints = @UniqueConstraint(columnNames = "account_id"))
public class GrowthMemory {

    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false, unique = true)
    private Account account;

    @Column(columnDefinition = "TEXT")
    private String journeySummary;

    @Column(columnDefinition = "TEXT")
    private String currentFocus;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String frictionPoints;

    @Column(columnDefinition = "TEXT")
    private String patterns;

    private LocalDate lastActivityDate;
    private Instant lastConversationAt;
    private Instant updatedAt;
}

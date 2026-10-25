package io.nexora.backend.progress.service;

import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.auth.repository.AccountRepository;
import io.nexora.backend.goal.repository.GoalRepository;
import io.nexora.backend.progress.dto.response.StreakResponse;
import io.nexora.backend.progress.repository.ProgressEntryRepository;
import io.nexora.backend.progress.repository.ProgressTaskEntryRepository;
import io.nexora.backend.roadmap.repository.MilestoneRepository;
import io.nexora.backend.roadmap.repository.RoadmapRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProgressServiceStreakTest {

    @Mock private ProgressEntryRepository progressEntryRepository;
    @Mock private ProgressTaskEntryRepository progressTaskEntryRepository;
    @Mock private GoalRepository goalRepository;
    @Mock private RoadmapRepository roadmapRepository;
    @Mock private MilestoneRepository milestoneRepository;
    @Mock private AccountRepository accountRepository;

    private ProgressService progressService;

    private static final String EMAIL = "owner@example.com";
    private Account account;

    @BeforeEach
    void setUp() {
        progressService = new ProgressService(
                progressEntryRepository, progressTaskEntryRepository, goalRepository,
                roadmapRepository, milestoneRepository, accountRepository);

        account = Account.builder().id(UUID.randomUUID()).email(EMAIL).build();
        when(accountRepository.findByEmail(EMAIL)).thenReturn(Optional.of(account));
    }

    @Test
    void getStreak_noEntries_returnsAllZeros() {
        when(progressEntryRepository.findDistinctEntryDatesByAccountId(account.getId()))
                .thenReturn(List.of());

        StreakResponse response = progressService.getStreak(EMAIL);

        assertThat(response.getCurrentStreakDays()).isZero();
        assertThat(response.getLongestStreakDays()).isZero();
        assertThat(response.getLastEntryDate()).isNull();
    }

    @Test
    void getStreak_threeConsecutiveDaysEndingToday_currentEqualsThree() {
        LocalDate today = LocalDate.now();
        when(progressEntryRepository.findDistinctEntryDatesByAccountId(account.getId()))
                .thenReturn(List.of(today, today.minusDays(1), today.minusDays(2)));

        StreakResponse response = progressService.getStreak(EMAIL);

        assertThat(response.getCurrentStreakDays()).isEqualTo(3);
        assertThat(response.getLongestStreakDays()).isEqualTo(3);
        assertThat(response.getLastEntryDate()).isEqualTo(today);
    }

    @Test
    void getStreak_lastEntryWasYesterday_streakStillCounts() {
        // "Currently active" includes yesterday — a user shouldn't see their
        // streak hit zero just because they haven't logged anything *yet today*.
        LocalDate today = LocalDate.now();
        when(progressEntryRepository.findDistinctEntryDatesByAccountId(account.getId()))
                .thenReturn(List.of(today.minusDays(1), today.minusDays(2)));

        StreakResponse response = progressService.getStreak(EMAIL);

        assertThat(response.getCurrentStreakDays()).isEqualTo(2);
    }

    @Test
    void getStreak_lastEntryWasThreeDaysAgo_currentStreakIsBroken() {
        LocalDate today = LocalDate.now();
        when(progressEntryRepository.findDistinctEntryDatesByAccountId(account.getId()))
                .thenReturn(List.of(today.minusDays(3), today.minusDays(4)));

        StreakResponse response = progressService.getStreak(EMAIL);

        assertThat(response.getCurrentStreakDays()).isZero();
        assertThat(response.getLongestStreakDays()).isEqualTo(2);
        assertThat(response.getLastEntryDate()).isEqualTo(today.minusDays(3));
    }

    @Test
    void getStreak_gapInHistory_longestCanExceedCurrent() {
        LocalDate today = LocalDate.now();
        // Active streak: today, yesterday (2 days).
        // Older streak further back: days 10-13 (4 days), separated by a gap.
        when(progressEntryRepository.findDistinctEntryDatesByAccountId(account.getId()))
                .thenReturn(List.of(
                        today, today.minusDays(1),
                        today.minusDays(10), today.minusDays(11), today.minusDays(12), today.minusDays(13)
                ));

        StreakResponse response = progressService.getStreak(EMAIL);

        assertThat(response.getCurrentStreakDays()).isEqualTo(2);
        assertThat(response.getLongestStreakDays()).isEqualTo(4);
    }
}

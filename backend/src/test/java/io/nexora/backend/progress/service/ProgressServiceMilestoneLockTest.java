package io.nexora.backend.progress.service;

import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.auth.repository.AccountRepository;
import io.nexora.backend.goal.entity.Goal;
import io.nexora.backend.goal.repository.GoalRepository;
import io.nexora.backend.progress.dto.request.CreateProgressTaskRequest;
import io.nexora.backend.progress.entity.ProgressTaskEntry;
import io.nexora.backend.progress.repository.ProgressEntryRepository;
import io.nexora.backend.progress.repository.ProgressTaskEntryRepository;
import io.nexora.backend.roadmap.entity.Milestone;
import io.nexora.backend.roadmap.entity.Roadmap;
import io.nexora.backend.roadmap.repository.MilestoneRepository;
import io.nexora.backend.roadmap.repository.RoadmapRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Covers the interaction between manual milestone toggling
 * (RoadmapService.setMilestoneCompletion) and the task-based auto-complete
 * in ProgressService.completeTask — specifically, that finishing every
 * task on a milestone the user already manually reopened does NOT
 * silently flip it back to complete.
 */
@ExtendWith(MockitoExtension.class)
class ProgressServiceMilestoneLockTest {

    @Mock private ProgressEntryRepository progressEntryRepository;
    @Mock private ProgressTaskEntryRepository progressTaskEntryRepository;
    @Mock private GoalRepository goalRepository;
    @Mock private RoadmapRepository roadmapRepository;
    @Mock private MilestoneRepository milestoneRepository;
    @Mock private AccountRepository accountRepository;

    private ProgressService progressService;

    private static final String OWNER_EMAIL = "owner@example.com";
    private static final UUID GOAL_ID = UUID.randomUUID();

    private Account owner;
    private Goal goal;
    private Roadmap roadmap;

    @BeforeEach
    void setUp() {
        progressService = new ProgressService(
                progressEntryRepository, progressTaskEntryRepository, goalRepository,
                roadmapRepository, milestoneRepository, accountRepository);

        owner = Account.builder().id(UUID.randomUUID()).email(OWNER_EMAIL).build();
        goal = Goal.builder().id(GOAL_ID).account(owner).build();
        roadmap = Roadmap.builder().id(UUID.randomUUID()).goal(goal).build();
    }

    @Test
    void completeTask_lastTaskOnManuallyReopenedMilestone_doesNotReComplete() {
        Milestone milestone = Milestone.builder()
                .id(UUID.randomUUID())
                .roadmap(roadmap)
                .title("Learn Spring basics")
                .tasks(List.of("Read docs", "Build a demo"))
                .completed(false)
                .manualOverride(true) // user explicitly reopened this milestone
                .build();
        roadmap.setMilestones(List.of(milestone));

        CreateProgressTaskRequest request = new CreateProgressTaskRequest("Learn Spring basics", "Build a demo");

        when(accountRepository.findByEmail(OWNER_EMAIL)).thenReturn(Optional.of(owner));
        when(goalRepository.findByIdAndDeletedFalse(GOAL_ID)).thenReturn(Optional.of(goal));
        when(roadmapRepository.findByGoalId(GOAL_ID)).thenReturn(Optional.of(roadmap));
        when(progressTaskEntryRepository.findByGoalIdAndMilestoneTitleAndTaskTitle(
                GOAL_ID, "Learn Spring basics", "Build a demo")).thenReturn(Optional.empty());
        when(progressTaskEntryRepository.save(any(ProgressTaskEntry.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        // Both tasks are now complete...
        when(progressTaskEntryRepository.countByGoalIdAndMilestoneTitleAndCompletedTrue(GOAL_ID, "Learn Spring basics"))
                .thenReturn(2L);

        progressService.completeTask(GOAL_ID, OWNER_EMAIL, request);

        // ...but because the milestone was manually reopened, completing
        // every task must NOT save it back to completed=true.
        verify(milestoneRepository, never()).save(any(Milestone.class));
        assertThat(milestone.isCompleted()).isFalse();
    }

    @Test
    void completeTask_lastTaskOnUnlockedMilestone_stillAutoCompletes() {
        Milestone milestone = Milestone.builder()
                .id(UUID.randomUUID())
                .roadmap(roadmap)
                .title("Learn Spring basics")
                .tasks(List.of("Read docs"))
                .completed(false)
                .manualOverride(false)
                .build();
        roadmap.setMilestones(List.of(milestone));

        CreateProgressTaskRequest request = new CreateProgressTaskRequest("Learn Spring basics", "Read docs");

        when(accountRepository.findByEmail(OWNER_EMAIL)).thenReturn(Optional.of(owner));
        when(goalRepository.findByIdAndDeletedFalse(GOAL_ID)).thenReturn(Optional.of(goal));
        when(roadmapRepository.findByGoalId(GOAL_ID)).thenReturn(Optional.of(roadmap));
        when(progressTaskEntryRepository.findByGoalIdAndMilestoneTitleAndTaskTitle(
                GOAL_ID, "Learn Spring basics", "Read docs")).thenReturn(Optional.empty());
        when(progressTaskEntryRepository.save(any(ProgressTaskEntry.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(progressTaskEntryRepository.countByGoalIdAndMilestoneTitleAndCompletedTrue(GOAL_ID, "Learn Spring basics"))
                .thenReturn(1L);

        progressService.completeTask(GOAL_ID, OWNER_EMAIL, request);

        verify(milestoneRepository).save(milestone);
        assertThat(milestone.isCompleted()).isTrue();
    }
}

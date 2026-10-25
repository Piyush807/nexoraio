package io.nexora.backend.roadmap.service;

import io.nexora.backend.ai.client.AIClient;
import io.nexora.backend.ai.prompt.PromptBuilder;
import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.common.exception.ResourceNotFoundException;
import io.nexora.backend.goal.entity.Goal;
import io.nexora.backend.goal.repository.GoalRepository;
import io.nexora.backend.roadmap.dto.request.SetMilestoneCompletionRequest;
import io.nexora.backend.roadmap.dto.response.RoadmapMilestoneResponse;
import io.nexora.backend.roadmap.entity.Milestone;
import io.nexora.backend.roadmap.entity.Roadmap;
import io.nexora.backend.roadmap.repository.MilestoneRepository;
import io.nexora.backend.roadmap.repository.RoadmapRepository;
import io.nexora.backend.roadmap.repository.SkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Covers only the new manual milestone-completion path. The existing
 * roadmap-generation behavior isn't touched by this feature, so it isn't
 * re-tested here.
 */
@ExtendWith(MockitoExtension.class)
class RoadmapServiceMilestoneTest {

    @Mock private RoadmapRepository roadmapRepository;
    @Mock private MilestoneRepository milestoneRepository;
    @Mock private SkillRepository skillRepository;
    @Mock private GoalRepository goalRepository;
    @Mock private AIClient aiClient;
    @Mock private PromptBuilder promptBuilder;

    private RoadmapService roadmapService;

    private static final String OWNER_EMAIL = "owner@example.com";
    private static final UUID GOAL_ID = UUID.randomUUID();

    private Account owner;
    private Goal goal;
    private Roadmap roadmap;

    @BeforeEach
    void setUp() {
        roadmapService = new RoadmapService(
                roadmapRepository, milestoneRepository, skillRepository, goalRepository, aiClient, promptBuilder);

        owner = Account.builder().id(UUID.randomUUID()).email(OWNER_EMAIL).build();
        goal = Goal.builder().id(GOAL_ID).account(owner).build();
        roadmap = Roadmap.builder().id(UUID.randomUUID()).goal(goal).active(true).build();
    }

    @Test
    void setMilestoneCompletion_marksMilestoneComplete_whenOwnedAndBelongsToRoadmap() {
        UUID milestoneId = UUID.randomUUID();
        Milestone milestone = Milestone.builder()
                .id(milestoneId)
                .roadmap(roadmap)
                .title("Learn Spring basics")
                .tasks(List.of("Read docs", "Build a demo"))
                .completed(false)
                .build();

        when(goalRepository.findByIdAndDeletedFalse(GOAL_ID)).thenReturn(Optional.of(goal));
        when(roadmapRepository.findByGoalId(GOAL_ID)).thenReturn(Optional.of(roadmap));
        when(milestoneRepository.findById(milestoneId)).thenReturn(Optional.of(milestone));
        when(milestoneRepository.save(any(Milestone.class))).thenAnswer(inv -> inv.getArgument(0));

        RoadmapMilestoneResponse response = roadmapService.setMilestoneCompletion(
                GOAL_ID, milestoneId, OWNER_EMAIL, new SetMilestoneCompletionRequest(true));

        assertThat(response.isCompleted()).isTrue();

        ArgumentCaptor<Milestone> captor = ArgumentCaptor.forClass(Milestone.class);
        verify(milestoneRepository).save(captor.capture());
        assertThat(captor.getValue().isCompleted()).isTrue();
        assertThat(captor.getValue().isManualOverride())
                .as("a manual toggle must opt the milestone out of task-based auto-complete")
                .isTrue();
    }

    @Test
    void setMilestoneCompletion_reopensAnAlreadyCompletedMilestone() {
        UUID milestoneId = UUID.randomUUID();
        Milestone milestone = Milestone.builder()
                .id(milestoneId)
                .roadmap(roadmap)
                .title("Learn Spring basics")
                .completed(true)
                .build();

        when(goalRepository.findByIdAndDeletedFalse(GOAL_ID)).thenReturn(Optional.of(goal));
        when(roadmapRepository.findByGoalId(GOAL_ID)).thenReturn(Optional.of(roadmap));
        when(milestoneRepository.findById(milestoneId)).thenReturn(Optional.of(milestone));
        when(milestoneRepository.save(any(Milestone.class))).thenAnswer(inv -> inv.getArgument(0));

        RoadmapMilestoneResponse response = roadmapService.setMilestoneCompletion(
                GOAL_ID, milestoneId, OWNER_EMAIL, new SetMilestoneCompletionRequest(false));

        assertThat(response.isCompleted()).isFalse();
    }

    @Test
    void setMilestoneCompletion_rejectsAMilestoneFromADifferentGoalsRoadmap() {
        UUID milestoneId = UUID.randomUUID();
        Roadmap otherRoadmap = Roadmap.builder().id(UUID.randomUUID()).build();
        Milestone milestoneFromOtherGoal = Milestone.builder()
                .id(milestoneId)
                .roadmap(otherRoadmap)
                .completed(false)
                .build();

        when(goalRepository.findByIdAndDeletedFalse(GOAL_ID)).thenReturn(Optional.of(goal));
        when(roadmapRepository.findByGoalId(GOAL_ID)).thenReturn(Optional.of(roadmap));
        when(milestoneRepository.findById(milestoneId)).thenReturn(Optional.of(milestoneFromOtherGoal));

        assertThatThrownBy(() -> roadmapService.setMilestoneCompletion(
                GOAL_ID, milestoneId, OWNER_EMAIL, new SetMilestoneCompletionRequest(true)))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(milestoneRepository, never()).save(any());
    }

    @Test
    void setMilestoneCompletion_rejectsWhenCallerDoesNotOwnTheGoal() {
        UUID milestoneId = UUID.randomUUID();

        when(goalRepository.findByIdAndDeletedFalse(GOAL_ID)).thenReturn(Optional.of(goal));

        assertThatThrownBy(() -> roadmapService.setMilestoneCompletion(
                GOAL_ID, milestoneId, "someone-else@example.com", new SetMilestoneCompletionRequest(true)))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(roadmapRepository, never()).findByGoalId(any());
        verify(milestoneRepository, never()).save(any());
    }

    @Test
    void setMilestoneCompletion_rejectsWhenMilestoneDoesNotExist() {
        UUID milestoneId = UUID.randomUUID();

        when(goalRepository.findByIdAndDeletedFalse(GOAL_ID)).thenReturn(Optional.of(goal));
        when(roadmapRepository.findByGoalId(GOAL_ID)).thenReturn(Optional.of(roadmap));
        when(milestoneRepository.findById(milestoneId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> roadmapService.setMilestoneCompletion(
                GOAL_ID, milestoneId, OWNER_EMAIL, new SetMilestoneCompletionRequest(true)))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}

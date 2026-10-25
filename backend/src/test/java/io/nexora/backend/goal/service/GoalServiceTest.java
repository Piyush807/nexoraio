package io.nexora.backend.goal.service;

import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.auth.repository.AccountRepository;
import io.nexora.backend.common.exception.ResourceNotFoundException;
import io.nexora.backend.goal.dto.request.CreateGoalRequest;
import io.nexora.backend.goal.dto.request.UpdateGoalRequest;
import io.nexora.backend.goal.dto.response.GoalResponse;
import io.nexora.backend.goal.entity.Goal;
import io.nexora.backend.goal.enums.CurrentLevel;
import io.nexora.backend.goal.enums.GoalStatus;
import io.nexora.backend.goal.mapper.GoalMapper;
import io.nexora.backend.goal.repository.GoalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoalServiceTest {

    @Mock private GoalRepository goalRepository;
    @Mock private AccountRepository accountRepository;

    // The real mapper — plain field mapping, no reason to mock it and doing
    // so would hide bugs in the mapping itself.
    private final GoalMapper goalMapper = new GoalMapper();

    private GoalService goalService;

    private Account owner;
    private Account someoneElse;
    private static final String OWNER_EMAIL = "owner@example.com";
    private static final String OTHER_EMAIL = "other@example.com";

    @BeforeEach
    void setUp() {
        goalService = new GoalService(goalRepository, goalMapper, accountRepository);

        owner = Account.builder().id(UUID.randomUUID()).email(OWNER_EMAIL).build();
        someoneElse = Account.builder().id(UUID.randomUUID()).email(OTHER_EMAIL).build();
    }

    private Goal existingGoal(Account account, boolean deleted) {
        return Goal.builder()
                .id(UUID.randomUUID())
                .title("Learn Spring Boot")
                .description("Get job-ready")
                .currentLevel(CurrentLevel.BEGINNER)
                .status(GoalStatus.ACTIVE)
                .targetDate(LocalDate.now().plusMonths(3))
                .dailyStudyHours(2)
                .account(account)
                .deleted(deleted)
                .build();
    }

    // --- createGoal ---

    @Test
    void createGoal_buildsActiveNonDeletedGoalOwnedByCaller() {
        when(accountRepository.findByEmail(OWNER_EMAIL)).thenReturn(Optional.of(owner));
        when(goalRepository.save(any(Goal.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateGoalRequest request = CreateGoalRequest.builder()
                .title("Learn Spring Boot")
                .description("Get job-ready")
                .currentLevel(CurrentLevel.BEGINNER)
                .targetDate(LocalDate.now().plusMonths(3))
                .dailyStudyHours(2)
                .build();

        GoalResponse response = goalService.createGoal(request, OWNER_EMAIL);

        ArgumentCaptor<Goal> captor = ArgumentCaptor.forClass(Goal.class);
        verify(goalRepository).save(captor.capture());
        Goal saved = captor.getValue();

        assertThat(saved.getAccount()).isEqualTo(owner);
        assertThat(saved.getStatus()).isEqualTo(GoalStatus.ACTIVE);
        assertThat(saved.isDeleted()).isFalse();
        assertThat(response.getTitle()).isEqualTo("Learn Spring Boot");
    }

    @Test
    void createGoal_unknownAccountEmail_throwsResourceNotFound() {
        when(accountRepository.findByEmail(OWNER_EMAIL)).thenReturn(Optional.empty());

        CreateGoalRequest request = CreateGoalRequest.builder()
                .title("x").currentLevel(CurrentLevel.BEGINNER)
                .targetDate(LocalDate.now()).dailyStudyHours(1).build();

        assertThatThrownBy(() -> goalService.createGoal(request, OWNER_EMAIL))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(goalRepository, never()).save(any());
    }

    // --- getGoals ---

    @Test
    void getGoals_returnsOnlyCallersNonDeletedGoals() {
        when(accountRepository.findByEmail(OWNER_EMAIL)).thenReturn(Optional.of(owner));
        Goal g1 = existingGoal(owner, false);
        when(goalRepository.findAllByAccountIdAndDeletedFalse(owner.getId())).thenReturn(List.of(g1));

        List<GoalResponse> goals = goalService.getGoals(OWNER_EMAIL);

        assertThat(goals).hasSize(1);
        assertThat(goals.get(0).getId()).isEqualTo(g1.getId());
    }

    // --- getGoalById / ownership enforcement ---

    @Test
    void getGoalById_ownedGoal_returnsIt() {
        Goal goal = existingGoal(owner, false);
        when(goalRepository.findByIdAndDeletedFalse(goal.getId())).thenReturn(Optional.of(goal));

        GoalResponse response = goalService.getGoalById(goal.getId(), OWNER_EMAIL);

        assertThat(response.getId()).isEqualTo(goal.getId());
    }

    @Test
    void getGoalById_goalOwnedBySomeoneElse_throwsResourceNotFound_notForbidden() {
        Goal goal = existingGoal(someoneElse, false);
        when(goalRepository.findByIdAndDeletedFalse(goal.getId())).thenReturn(Optional.of(goal));

        // Deliberately 404, not 403 — the service must not reveal that a
        // goal belonging to someone else exists at all.
        assertThatThrownBy(() -> goalService.getGoalById(goal.getId(), OWNER_EMAIL))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getGoalById_softDeletedGoal_isTreatedAsNotFound() {
        UUID goalId = UUID.randomUUID();
        // findByIdAndDeletedFalse itself excludes soft-deleted rows, so a
        // deleted goal's id simply won't be found.
        when(goalRepository.findByIdAndDeletedFalse(goalId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> goalService.getGoalById(goalId, OWNER_EMAIL))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // --- updateGoal ---

    @Test
    void updateGoal_ownedGoal_appliesAllFieldsAndSaves() {
        Goal goal = existingGoal(owner, false);
        when(goalRepository.findByIdAndDeletedFalse(goal.getId())).thenReturn(Optional.of(goal));
        when(goalRepository.save(any(Goal.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateGoalRequest request = UpdateGoalRequest.builder()
                .title("Master Spring Boot")
                .description("Updated")
                .currentLevel(CurrentLevel.INTERMEDIATE)
                .status(GoalStatus.PAUSED)
                .targetDate(LocalDate.now().plusMonths(6))
                .dailyStudyHours(3)
                .build();

        GoalResponse response = goalService.updateGoal(goal.getId(), request, OWNER_EMAIL);

        assertThat(response.getTitle()).isEqualTo("Master Spring Boot");
        assertThat(response.getStatus()).isEqualTo(GoalStatus.PAUSED);
        assertThat(response.getDailyStudyHours()).isEqualTo(3);
    }

    @Test
    void updateGoal_goalOwnedBySomeoneElse_throwsAndDoesNotSave() {
        Goal goal = existingGoal(someoneElse, false);
        when(goalRepository.findByIdAndDeletedFalse(goal.getId())).thenReturn(Optional.of(goal));

        UpdateGoalRequest request = UpdateGoalRequest.builder().title("Hijacked").build();

        assertThatThrownBy(() -> goalService.updateGoal(goal.getId(), request, OWNER_EMAIL))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(goalRepository, never()).save(any());
    }

    // --- deleteGoal ---

    @Test
    void deleteGoal_ownedGoal_softDeletesRatherThanRemoving() {
        Goal goal = existingGoal(owner, false);
        when(goalRepository.findByIdAndDeletedFalse(goal.getId())).thenReturn(Optional.of(goal));
        when(goalRepository.save(any(Goal.class))).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<Void> response = goalService.deleteGoal(goal.getId(), OWNER_EMAIL);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(goal.isDeleted()).isTrue();
        // Soft delete: the row is saved with deleted=true, never removed via repository.delete*.
        verify(goalRepository).save(goal);
        verify(goalRepository, never()).delete(any());
        verify(goalRepository, never()).deleteById(any());
    }

    @Test
    void deleteGoal_goalOwnedBySomeoneElse_throwsAndDoesNotDelete() {
        Goal goal = existingGoal(someoneElse, false);
        when(goalRepository.findByIdAndDeletedFalse(goal.getId())).thenReturn(Optional.of(goal));

        assertThatThrownBy(() -> goalService.deleteGoal(goal.getId(), OWNER_EMAIL))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(goalRepository, never()).save(any());
        assertThat(goal.isDeleted()).isFalse();
    }
}

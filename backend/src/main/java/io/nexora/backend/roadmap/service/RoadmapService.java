package io.nexora.backend.roadmap.service;

import io.nexora.backend.ai.client.AIClient;
import io.nexora.backend.ai.dto.MilestoneDTO;
import io.nexora.backend.ai.dto.RoadmapGenerationResponse;
import io.nexora.backend.ai.dto.SkillDTO;
import io.nexora.backend.ai.prompt.PromptBuilder;
import io.nexora.backend.common.exception.ResourceNotFoundException;
import io.nexora.backend.goal.entity.Goal;
import io.nexora.backend.goal.repository.GoalRepository;
import io.nexora.backend.roadmap.dto.request.SetMilestoneCompletionRequest;
import io.nexora.backend.roadmap.dto.response.RoadmapMilestoneResponse;
import io.nexora.backend.roadmap.dto.response.RoadmapResponse;
import io.nexora.backend.roadmap.dto.response.RoadmapSkillResponse;
import io.nexora.backend.roadmap.entity.Milestone;
import io.nexora.backend.roadmap.entity.Roadmap;
import io.nexora.backend.roadmap.entity.Skill;
import io.nexora.backend.roadmap.repository.MilestoneRepository;
import io.nexora.backend.roadmap.repository.RoadmapRepository;
import io.nexora.backend.roadmap.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class RoadmapService {

    private final RoadmapRepository roadmapRepository;
    private final MilestoneRepository milestoneRepository;
    private final SkillRepository skillRepository;
    private final GoalRepository goalRepository;
    private final AIClient aiClient;
    private final PromptBuilder promptBuilder;

    @Transactional
    public RoadmapResponse generateRoadmap(UUID goalId, String email) {

        Goal goal = getAuthorizedGoal(goalId, email);

        Roadmap existingRoadmap = roadmapRepository.findByGoalId(goalId).orElse(null);
        if (existingRoadmap != null) {
            return toResponse(existingRoadmap);
        }

        RoadmapGenerationResponse aiResponse = aiClient.generate(
                promptBuilder.buildRoadmapPrompt(goal),
                RoadmapGenerationResponse.class
        );

        Roadmap savedRoadmap = roadmapRepository.save(
                Roadmap.builder()
                        .goal(goal)
                        .title(goal.getTitle() + " Roadmap")
                        .description(goal.getDescription() != null
                                ? goal.getDescription()
                                : "AI generated roadmap")
                        .generatedAt(Instant.now())
                        .active(true)
                        .build()
        );

        List<Skill> skills = aiResponse.getSkills() == null
                ? List.of()
                : aiResponse.getSkills().stream()
                .map(skill -> toSkillEntity(savedRoadmap, skill))
                .toList();

        List<Milestone> milestones = aiResponse.getMilestones() == null
                ? List.of()
                : IntStream.range(0, aiResponse.getMilestones().size())
                .mapToObj(index -> toMilestoneEntity(savedRoadmap, aiResponse.getMilestones().get(index), index + 1))
                .toList();

        if (!skills.isEmpty()) {
            skillRepository.saveAll(skills);
        }

        if (!milestones.isEmpty()) {
            milestoneRepository.saveAll(milestones);
        }

        return toResponse(savedRoadmap);
    }

    @Transactional
    public RoadmapResponse regenerateRoadmap(UUID goalId, String email) {
        Goal goal = getAuthorizedGoal(goalId, email);
        RoadmapGenerationResponse aiResponse = aiClient.generate(
                promptBuilder.buildRoadmapPrompt(goal), RoadmapGenerationResponse.class);
        Roadmap roadmap = roadmapRepository.findByGoalId(goalId).orElseGet(() -> Roadmap.builder()
                .goal(goal).title(goal.getTitle() + " Roadmap").build());

        // Mutate the existing roadmap identity so historical progress records keep
        // their roadmap foreign key instead of being orphaned. Only replace its
        // generated children after AI generation succeeds.
        roadmap.getMilestones().clear();
        roadmap.getSkills().clear();
        roadmap.setTitle(goal.getTitle() + " Roadmap");
        roadmap.setDescription(goal.getDescription() != null ? goal.getDescription() : "AI generated roadmap");
        roadmap.setGeneratedAt(Instant.now());
        roadmap.setActive(true);
        Roadmap saved = roadmapRepository.save(roadmap);
        if (aiResponse.getSkills() != null) skillRepository.saveAll(aiResponse.getSkills().stream().map(x -> toSkillEntity(saved, x)).toList());
        if (aiResponse.getMilestones() != null) milestoneRepository.saveAll(IntStream.range(0, aiResponse.getMilestones().size())
                .mapToObj(i -> toMilestoneEntity(saved, aiResponse.getMilestones().get(i), i + 1)).toList());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public RoadmapResponse getRoadmapByGoalId(UUID goalId, String email) {

        Goal goal = getAuthorizedGoal(goalId, email);

        Roadmap roadmap = roadmapRepository.findByGoalId(goal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap not found"));

        return toResponse(roadmap);
    }

    /**
     * Manually sets a milestone's completion state. This sets
     * `manualOverride`, which permanently opts this milestone out of the
     * task-based auto-complete in ProgressService.completeTask — once a
     * user has explicitly said whether a milestone is done, checking off
     * (or leaving unchecked) individual tasks should never silently
     * override that again.
     */
    @Transactional
    public RoadmapMilestoneResponse setMilestoneCompletion(
            UUID goalId, UUID milestoneId, String email, SetMilestoneCompletionRequest request) {

        Goal goal = getAuthorizedGoal(goalId, email);

        Roadmap roadmap = roadmapRepository.findByGoalId(goal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap not found"));

        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found"));

        // A milestone ID is a guessable-format UUID like any other; without
        // this check, an authenticated user could toggle a milestone that
        // belongs to a *different* goal (even a different account's goal)
        // as long as they knew or brute-forced its ID.
        if (!milestone.getRoadmap().getId().equals(roadmap.getId())) {
            throw new ResourceNotFoundException("Milestone not found");
        }

        milestone.setCompleted(request.getCompleted());
        milestone.setManualOverride(true);
        Milestone saved = milestoneRepository.save(milestone);

        return toMilestoneResponse(saved);
    }

    /**
     * Looks up a roadmap by goal id without an ownership check, for callers
     * (e.g. MessageService) that have already authorized the caller via a
     * different owning entity (the conversation). Returns null instead of
     * throwing when no roadmap exists yet, since "no roadmap" is a normal
     * state for AI chat context, not an error.
     */
    @Transactional(readOnly = true)
    public java.util.Map<UUID, Roadmap> findRoadmapsByGoalIds(List<UUID> goalIds) {
        if (goalIds == null || goalIds.isEmpty()) return java.util.Map.of();
        return roadmapRepository.findAllByGoalIdIn(goalIds).stream().collect(java.util.stream.Collectors.toMap(r -> r.getGoal().getId(), r -> r));
    }

    public RoadmapResponse toResponseForInternal(Roadmap roadmap) {
        return toResponse(roadmap);
    }

    @Transactional(readOnly = true)
    public RoadmapResponse getRoadmapByGoalIdOrNull(UUID goalId) {
        return roadmapRepository.findByGoalId(goalId)
                .map(this::toResponse)
                .orElse(null);
    }

    private Goal getAuthorizedGoal(UUID goalId, String email) {

        Goal goal = goalRepository.findByIdAndDeletedFalse(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (!goal.getAccount().getEmail().equals(email)) {
            throw new ResourceNotFoundException("Goal not found");
        }

        return goal;
    }

    private Skill toSkillEntity(Roadmap roadmap, SkillDTO skillDTO) {
        return Skill.builder()
                .roadmap(roadmap)
                .name(skillDTO.getName())
                .description(null)
                .progressPercentage(0)
                .completed(false)
                .build();
    }

    private Milestone toMilestoneEntity(Roadmap roadmap, MilestoneDTO milestoneDTO, Integer orderIndex) {
        return Milestone.builder()
                .roadmap(roadmap)
                .title(milestoneDTO.getTitle())
                .description(milestoneDTO.getDescription())
                .orderIndex(orderIndex)
                .estimatedDays(milestoneDTO.getEstimatedDays())
                .tasks(milestoneDTO.getTasks() == null ? List.of() : milestoneDTO.getTasks())
                .completed(false)
                .build();
    }

    private RoadmapResponse toResponse(Roadmap roadmap) {
        return RoadmapResponse.builder()
                .id(roadmap.getId())
                .goalId(roadmap.getGoal() != null ? roadmap.getGoal().getId() : null)
                .title(roadmap.getTitle())
                .description(roadmap.getDescription())
                .generatedAt(roadmap.getGeneratedAt())
                .active(roadmap.isActive())
                .skills(skillRepository.findAllByRoadmapId(roadmap.getId())
                        .stream()
                        .map(this::toSkillResponse)
                        .toList())
                .milestones(milestoneRepository.findAllByRoadmapIdOrderByOrderIndex(roadmap.getId())
                        .stream()
                        .map(this::toMilestoneResponse)
                        .toList())
                .build();
    }

    private RoadmapSkillResponse toSkillResponse(Skill skill) {
        return RoadmapSkillResponse.builder()
                .id(skill.getId())
                .name(skill.getName())
                .description(skill.getDescription())
                .progressPercentage(skill.getProgressPercentage())
                .completed(skill.isCompleted())
                .build();
    }

    private RoadmapMilestoneResponse toMilestoneResponse(Milestone milestone) {
        return RoadmapMilestoneResponse.builder()
                .id(milestone.getId())
                .title(milestone.getTitle())
                .description(milestone.getDescription())
                .orderIndex(milestone.getOrderIndex())
                .estimatedDays(milestone.getEstimatedDays())
                .tasks(milestone.getTasks())
                .completed(milestone.isCompleted())
                .manualOverride(milestone.isManualOverride())
                .build();
    }
}

package io.nexora.backend.roadmap.service;

import io.nexora.backend.ai.client.AIClient;
import io.nexora.backend.ai.dto.MilestoneDTO;
import io.nexora.backend.ai.dto.RoadmapGenerationResponse;
import io.nexora.backend.ai.dto.SkillDTO;
import io.nexora.backend.ai.prompt.PromptBuilder;
import io.nexora.backend.common.exception.ResourceNotFoundException;
import io.nexora.backend.goal.entity.Goal;
import io.nexora.backend.goal.repository.GoalRepository;
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

    @Transactional(readOnly = true)
    public RoadmapResponse getRoadmapByGoalId(UUID goalId, String email) {

        Goal goal = getAuthorizedGoal(goalId, email);

        Roadmap roadmap = roadmapRepository.findByGoalId(goal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap not found"));

        return toResponse(roadmap);
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
                .build();
    }
}

package io.nexora.backend.task.mapper;

import io.nexora.backend.task.dto.response.TaskResponse;
import io.nexora.backend.task.entity.Task;

public class TaskMapper {

    public TaskResponse toResponse(Task task){
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getDeadline(),
                task.getStatus(),
                task.getCreatedAt(),
                task.getUpdatedAt(),
                task.getPriority(),
                task.getProject().getId()
        );
    }
}

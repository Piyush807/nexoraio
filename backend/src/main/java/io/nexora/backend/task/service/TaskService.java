package io.nexora.backend.task.service;

import io.nexora.backend.common.exception.ResourceNotFoundException;
import io.nexora.backend.project.entity.Project;
import io.nexora.backend.project.repository.ProjectRepository;
import io.nexora.backend.project.service.ProjectService;
import io.nexora.backend.task.dto.request.CreateTaskRequest;
import io.nexora.backend.task.dto.request.UpdateTaskRequest;
import io.nexora.backend.task.dto.response.TaskResponse;
import io.nexora.backend.task.entity.Task;
import io.nexora.backend.task.eums.TaskStatus;
import io.nexora.backend.task.mapper.TaskMapper;
import io.nexora.backend.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;
    private final ProjectService projectService;

    private Task getAuthorizedTask(UUID taskId, String email) {
        Task task = taskRepository.findByIdAndDeletedFalse(taskId).
                orElseThrow(()->new ResourceNotFoundException("Task with id: " + taskId + " not found"));
        projectService.getAuthorizedProject(task.getProject().getId(), email);
        return task;

    }

    public TaskResponse createTask(UUID projectId, CreateTaskRequest request, String email) {
        Project project = projectService.getAuthorizedProject(projectId, email);

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setProject(project);
        task.setCreatedAt(Instant.now());
        task.setUpdatedAt(Instant.now());
        task.setDeadline(request.getDeadline());
        task.setPriority(request.getPriority());
        task.setStatus(TaskStatus.ACTIVE);
        Task savedTask= taskRepository.save(task);

        return taskMapper.toResponse(savedTask);

    }

    public List<TaskResponse> getTasks(UUID projectId, String email) {
        projectService.getAuthorizedProject(projectId,  email);

        List<Task> tasks = taskRepository.findAllByProjectIdAndDeletedFalse(projectId);
        return tasks.stream()
                .map(taskMapper::toResponse).toList();
    }

    public TaskResponse getTaskById(UUID taskId, String email) {
        Task task = getAuthorizedTask(taskId, email);
        return taskMapper.toResponse(task);
    }

   public TaskResponse updateTask(UUID taskId, UpdateTaskRequest request, String email) {
        Task task = getAuthorizedTask(taskId, email);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDeadline(request.getDeadline());
        task.setUpdatedAt(Instant.now());
        task.setStatus(request.getStatus());
        taskRepository.save(task);
        return taskMapper.toResponse(task);
    }

    public ResponseEntity<Void> deleteTask(UUID taskId, String email) {
        Task task = getAuthorizedTask(taskId, email);
        task.setDeleted(true);
        taskRepository.save(task);
        return ResponseEntity.ok().build();
    }



}

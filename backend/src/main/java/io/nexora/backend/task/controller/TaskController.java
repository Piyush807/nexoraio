package io.nexora.backend.task.controller;

import io.nexora.backend.project.service.ProjectService;
import io.nexora.backend.task.dto.request.CreateTaskRequest;
import io.nexora.backend.task.dto.request.UpdateTaskRequest;
import io.nexora.backend.task.dto.response.TaskResponse;
import io.nexora.backend.task.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/projects/{projectId}/tasks")
public class TaskController {
    private final TaskService taskService;

    @PostMapping
    public TaskResponse createTask (@PathVariable("projectId") UUID projectId, @Valid @RequestBody CreateTaskRequest createTaskRequest, Authentication authentication) {
        return taskService.createTask(projectId, createTaskRequest, authentication.getName());
    }

    @GetMapping
    public List<TaskResponse> getTasks(@PathVariable("projectId") UUID projectId, Authentication authentication) {
        return taskService.getTasks(projectId, authentication.getName());
    }

    @GetMapping("/{taskId}")
    public TaskResponse getTaskById (@PathVariable("taskId") UUID taskId, Authentication authentication) {
        return taskService.getTaskById(taskId, authentication.getName());
    }

   @PutMapping("/{taskId}")
    public TaskResponse updateTask (@PathVariable("taskId") UUID taskId, @Valid @RequestBody UpdateTaskRequest updateTaskRequest, Authentication authentication) {
        return taskService.updateTask(taskId, updateTaskRequest, authentication.getName());
   }

   @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask (@PathVariable("taskId") UUID taskId, Authentication authentication) {
        return taskService.deleteTask(taskId, authentication.getName());
   }


}

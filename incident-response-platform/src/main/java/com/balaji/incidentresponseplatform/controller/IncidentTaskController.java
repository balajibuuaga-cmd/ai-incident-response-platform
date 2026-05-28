package com.balaji.incidentresponseplatform.controller;

import com.balaji.incidentresponseplatform.entity.IncidentTask;
import com.balaji.incidentresponseplatform.repository.IncidentTaskRepository;
import com.balaji.incidentresponseplatform.service.WebSocketNotificationService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/incidents/{incidentId}/tasks")
@CrossOrigin(origins = "*")
public class IncidentTaskController {

    private final IncidentTaskRepository taskRepository;
    private final WebSocketNotificationService notificationService;

    public IncidentTaskController(
            IncidentTaskRepository taskRepository,
            WebSocketNotificationService notificationService) {

        this.taskRepository = taskRepository;
        this.notificationService = notificationService;
    }

    @PostMapping
    public IncidentTask createTask(
            @PathVariable Long incidentId,
            @RequestBody IncidentTask task) {

        task.setIncidentId(incidentId);
        task.setCompleted(false);
        task.setCreatedAt(LocalDateTime.now());

        IncidentTask savedTask = taskRepository.save(task);

        notificationService.sendIncidentUpdate(
                "Task added to incident #" + incidentId
        );

        return savedTask;
    }

    @GetMapping
    public List<IncidentTask> getTasks(@PathVariable Long incidentId) {
        return taskRepository.findByIncidentId(incidentId);
    }

    @PutMapping("/{taskId}/complete")
    public IncidentTask completeTask(
            @PathVariable Long incidentId,
            @PathVariable Long taskId) {

        IncidentTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setCompleted(true);
        task.setCompletedAt(LocalDateTime.now());

        IncidentTask savedTask = taskRepository.save(task);

        notificationService.sendIncidentUpdate(
                "Task completed for incident #" + incidentId
        );

        return savedTask;
    }

    @DeleteMapping("/{taskId}")
    public String deleteTask(
            @PathVariable Long incidentId,
            @PathVariable Long taskId) {

        taskRepository.deleteById(taskId);

        notificationService.sendIncidentUpdate(
                "Task deleted from incident #" + incidentId
        );

        return "Task deleted successfully";
    }
}
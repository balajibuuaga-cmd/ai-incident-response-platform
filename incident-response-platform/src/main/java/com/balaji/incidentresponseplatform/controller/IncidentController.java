package com.balaji.incidentresponseplatform.controller;

import com.balaji.incidentresponseplatform.dto.CommentRequest;
import com.balaji.incidentresponseplatform.entity.Incident;
import com.balaji.incidentresponseplatform.entity.IncidentComment;
import com.balaji.incidentresponseplatform.entity.IncidentHistory;
import com.balaji.incidentresponseplatform.repository.IncidentCommentRepository;
import com.balaji.incidentresponseplatform.repository.IncidentHistoryRepository;
import com.balaji.incidentresponseplatform.repository.IncidentRepository;
import com.balaji.incidentresponseplatform.service.WebSocketNotificationService;
import org.springframework.web.bind.annotation.*;
import com.balaji.incidentresponseplatform.entity.BusinessService;
import com.balaji.incidentresponseplatform.repository.BusinessServiceRepository;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = "*")
public class IncidentController {

    private final IncidentRepository incidentRepository;
    private final IncidentCommentRepository commentRepository;
    private final IncidentHistoryRepository historyRepository;
    private final WebSocketNotificationService notificationService;
    private final BusinessServiceRepository businessServiceRepository;


    public IncidentController(
            IncidentRepository incidentRepository,
            IncidentHistoryRepository historyRepository,
            IncidentCommentRepository commentRepository,
            WebSocketNotificationService notificationService,
            BusinessServiceRepository businessServiceRepository
    ) {
        this.incidentRepository = incidentRepository;
        this.historyRepository = historyRepository;
        this.commentRepository = commentRepository;
        this.notificationService = notificationService;
        this.businessServiceRepository = businessServiceRepository;
    }

    @PostMapping
    public Incident createIncident(@RequestBody Incident incident) {

        incident.setStatus("OPEN");
        incident.setCreatedAt(LocalDateTime.now());
        incident.setUpdatedAt(LocalDateTime.now());

        incident.setPriority(
                calculatePriority(
                        incident.getSeverity(),
                        incident.getStatus()
                )
        );

        // ADD THIS BLOCK HERE
        if (incident.getServiceId() != null) {

            BusinessService service =
                    businessServiceRepository.findById(
                            incident.getServiceId()
                    ).orElseThrow(() ->
                            new RuntimeException("Business service not found")
                    );

            incident.setServiceName(service.getServiceName());
        }

        Incident savedIncident = incidentRepository.save(incident);

        notificationService.sendIncidentUpdate(
                "New incident created: " + savedIncident.getTitle()
        );

        return savedIncident;
    }

    @GetMapping
    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    @GetMapping("/{id}")
    public Incident getIncidentById(@PathVariable Long id) {
        return incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
    }

    @PutMapping("/{id}/status")
    public Incident updateIncidentStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(defaultValue = "System") String changedBy) {

        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        String oldStatus = incident.getStatus();

        incident.setStatus(status);
        incident.setUpdatedAt(LocalDateTime.now());
        incident.setPriority(calculatePriority(incident.getSeverity(), status));

        Incident savedIncident = incidentRepository.save(incident);

        IncidentHistory history = new IncidentHistory();
        history.setIncidentId(id);
        history.setOldStatus(oldStatus);
        history.setNewStatus(status);
        history.setChangedBy(changedBy);
        history.setChangedAt(LocalDateTime.now());

        historyRepository.save(history);

        notificationService.sendIncidentUpdate(
                "Incident #" + id + " status changed from " + oldStatus + " to " + status
        );

        return savedIncident;
    }

    @DeleteMapping("/{id}")
    public String deleteIncident(@PathVariable Long id) {
        incidentRepository.deleteById(id);

        notificationService.sendIncidentUpdate(
                "Incident #" + id + " deleted"
        );

        return "Incident deleted successfully";
    }

    @PostMapping("/{id}/comments")
    public IncidentComment addComment(
            @PathVariable Long id,
            @RequestBody CommentRequest request) {

        IncidentComment comment = new IncidentComment();

        comment.setIncidentId(id);
        comment.setAuthor(request.getAuthor());
        comment.setComment(request.getComment());
        comment.setCreatedAt(LocalDateTime.now());

        IncidentComment savedComment = commentRepository.save(comment);

        notificationService.sendIncidentUpdate(
                "New comment added to incident #" + id
        );

        return savedComment;
    }

    @GetMapping("/{id}/comments")
    public List<IncidentComment> getComments(@PathVariable Long id) {
        return commentRepository.findByIncidentId(id);
    }

    @GetMapping("/{id}/history")
    public List<IncidentHistory> getIncidentHistory(@PathVariable Long id) {
        return historyRepository.findByIncidentId(id);
    }

    @GetMapping("/stats")
    public Map<String, Long> getIncidentStats() {
        List<Incident> incidents = incidentRepository.findAll();

        long total = incidents.size();
        long open = incidents.stream()
                .filter(i -> "OPEN".equals(i.getStatus()))
                .count();
        long inProgress = incidents.stream()
                .filter(i -> "IN_PROGRESS".equals(i.getStatus()))
                .count();
        long resolved = incidents.stream()
                .filter(i -> "RESOLVED".equals(i.getStatus()))
                .count();
        long closed = incidents.stream()
                .filter(i -> "CLOSED".equals(i.getStatus()))
                .count();
        long high = incidents.stream()
                .filter(i -> "HIGH".equals(i.getSeverity()))
                .count();

        Map<String, Long> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("open", open);
        stats.put("inProgress", inProgress);
        stats.put("resolved", resolved);
        stats.put("closed", closed);
        stats.put("highSeverity", high);

        return stats;
    }

    @GetMapping("/{id}/ai-summary")
    public Map<String, String> generateAiSummary(@PathVariable Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        Map<String, String> summary = new HashMap<>();

        summary.put("incidentTitle", incident.getTitle());
        summary.put("summary", "AI Summary: " + incident.getDescription());
        summary.put(
                "possibleRootCause",
                "Possible root cause may be suspicious activity from the source system: "
                        + incident.getSource()
        );
        summary.put(
                "recommendedAction",
                "Review logs, validate affected accounts, block suspicious IPs, and escalate if repeated activity continues."
        );
        summary.put("riskLevel", incident.getSeverity());

        return summary;
    }
    @PutMapping("/{id}/assign")
    public Incident assignIncident(
            @PathVariable Long id,
            @RequestParam String assignedTo,
            @RequestParam(defaultValue = "System") String changedBy) {

        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        incident.setAssignedTo(assignedTo);
        incident.setUpdatedAt(LocalDateTime.now());

        Incident savedIncident = incidentRepository.save(incident);

        notificationService.sendIncidentUpdate(
                "Incident #" + id + " assigned to " + assignedTo + " by " + changedBy
        );

        return savedIncident;
    }

    private String calculatePriority(String severity, String status) {
        if ("HIGH".equalsIgnoreCase(severity) && "OPEN".equalsIgnoreCase(status)) {
            return "CRITICAL";
        }

        if ("HIGH".equalsIgnoreCase(severity)) {
            return "HIGH";
        }

        if ("MEDIUM".equalsIgnoreCase(severity)) {
            return "MEDIUM";
        }

        return "LOW";
    }

    @PutMapping("/{id}/priority")
    public Incident updatePriority(
            @PathVariable Long id,
            @RequestParam String priority) {

        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        incident.setPriority(priority);
        incident.setUpdatedAt(LocalDateTime.now());

        Incident savedIncident = incidentRepository.save(incident);

        notificationService.sendIncidentUpdate(
                "Incident #" + id + " priority changed to " + priority
        );

        return savedIncident;
    }

    @PostMapping("/{id}/servicenow-ticket")
    public Incident createServiceNowTicket(@PathVariable Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        if (incident.getServiceNowTicketNumber() == null ||
                incident.getServiceNowTicketNumber().isBlank()) {

            String ticketNumber = "INC" + System.currentTimeMillis();

            incident.setServiceNowTicketNumber(ticketNumber);
            incident.setUpdatedAt(LocalDateTime.now());

            incidentRepository.save(incident);

            notificationService.sendIncidentUpdate(
                    "ServiceNow ticket created for incident #" + id + ": " + ticketNumber
            );
        }

        return incident;
    }
}

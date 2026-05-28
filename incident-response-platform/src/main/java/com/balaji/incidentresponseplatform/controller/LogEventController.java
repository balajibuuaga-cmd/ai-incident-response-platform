package com.balaji.incidentresponseplatform.controller;

import com.balaji.incidentresponseplatform.entity.Incident;
import com.balaji.incidentresponseplatform.entity.LogEvent;
import com.balaji.incidentresponseplatform.repository.IncidentRepository;
import com.balaji.incidentresponseplatform.repository.LogEventRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "*")
public class LogEventController {

    private final LogEventRepository logRepository;
    private final IncidentRepository incidentRepository;

    public LogEventController(
            LogEventRepository logRepository,
            IncidentRepository incidentRepository) {

        this.logRepository = logRepository;
        this.incidentRepository = incidentRepository;
    }

    @PostMapping("/ingest")
    public LogEvent ingestLog(@RequestBody LogEvent logEvent) {

        logEvent.setTimestamp(LocalDateTime.now());

        LogEvent savedLog = logRepository.save(logEvent);

        if ("ERROR".equalsIgnoreCase(logEvent.getLevel())
                || "CRITICAL".equalsIgnoreCase(logEvent.getLevel())) {

            Incident incident = new Incident();

            incident.setTitle("Auto-created from log");
            incident.setDescription(logEvent.getMessage());
            incident.setSeverity(
                    "CRITICAL".equalsIgnoreCase(logEvent.getLevel())
                            ? "HIGH"
                            : "MEDIUM"
            );
            incident.setSource(logEvent.getSource());
            incident.setStatus("OPEN");
            incident.setCreatedAt(LocalDateTime.now());
            incident.setUpdatedAt(LocalDateTime.now());

            incidentRepository.save(incident);
        }

        return savedLog;
    }

    @GetMapping
    public List<LogEvent> getAllLogs() {
        return logRepository.findAll();
    }
    @GetMapping("/search/level")
    public List<LogEvent> searchByLevel(@RequestParam String level) {
        return logRepository.findByLevelIgnoreCase(level);
    }

    @GetMapping("/search/source")
    public List<LogEvent> searchBySource(@RequestParam String source) {
        return logRepository.findBySourceIgnoreCase(source);
    }
}
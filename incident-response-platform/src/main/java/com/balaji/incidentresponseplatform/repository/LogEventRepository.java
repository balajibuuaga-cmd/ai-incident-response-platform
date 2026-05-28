package com.balaji.incidentresponseplatform.repository;

import com.balaji.incidentresponseplatform.entity.LogEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LogEventRepository extends JpaRepository<LogEvent, Long> {

    List<LogEvent> findByLevelIgnoreCase(String level);

    List<LogEvent> findBySourceIgnoreCase(String source);
}
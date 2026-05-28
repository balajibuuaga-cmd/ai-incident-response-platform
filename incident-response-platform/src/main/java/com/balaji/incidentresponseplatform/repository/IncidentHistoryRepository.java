package com.balaji.incidentresponseplatform.repository;

import com.balaji.incidentresponseplatform.entity.IncidentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IncidentHistoryRepository extends JpaRepository<IncidentHistory, Long> {
    List<IncidentHistory> findByIncidentId(Long incidentId);
}
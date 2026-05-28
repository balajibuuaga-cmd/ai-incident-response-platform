package com.balaji.incidentresponseplatform.repository;

import com.balaji.incidentresponseplatform.entity.IncidentTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentTaskRepository extends JpaRepository<IncidentTask, Long> {

    List<IncidentTask> findByIncidentId(Long incidentId);
}
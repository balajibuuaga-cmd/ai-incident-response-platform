package com.balaji.incidentresponseplatform.repository;

import com.balaji.incidentresponseplatform.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentRepository
        extends JpaRepository<Incident, Long> {
}
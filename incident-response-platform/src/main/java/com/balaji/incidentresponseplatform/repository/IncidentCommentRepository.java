package com.balaji.incidentresponseplatform.repository;

import com.balaji.incidentresponseplatform.entity.IncidentComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentCommentRepository
        extends JpaRepository<IncidentComment, Long> {

    List<IncidentComment> findByIncidentId(Long incidentId);
}
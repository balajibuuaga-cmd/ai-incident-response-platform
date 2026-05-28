package com.balaji.incidentresponseplatform.repository;

import com.balaji.incidentresponseplatform.entity.BusinessService;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessServiceRepository extends JpaRepository<BusinessService, Long> {
}
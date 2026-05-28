package com.balaji.incidentresponseplatform.controller;

import com.balaji.incidentresponseplatform.entity.BusinessService;
import com.balaji.incidentresponseplatform.repository.BusinessServiceRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "*")
public class BusinessServiceController {

    private final BusinessServiceRepository serviceRepository;

    public BusinessServiceController(BusinessServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    @PostMapping
    public BusinessService createService(@RequestBody BusinessService service) {
        service.setCreatedAt(LocalDateTime.now());
        return serviceRepository.save(service);
    }

    @GetMapping
    public List<BusinessService> getAllServices() {
        return serviceRepository.findAll();
    }

    @GetMapping("/{id}")
    public BusinessService getServiceById(@PathVariable Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
    }

    @DeleteMapping("/{id}")
    public String deleteService(@PathVariable Long id) {
        serviceRepository.deleteById(id);
        return "Service deleted successfully";
    }
}
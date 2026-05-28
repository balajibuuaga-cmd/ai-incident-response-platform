package com.balaji.incidentresponseplatform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 2000)
    private String description;

    private String severity;

    private String status;

    private String source;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String assignedTo;

    private String priority;

    private String serviceNowTicketNumber;

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public String getServiceNowTicketNumber() {
        return serviceNowTicketNumber;
    }

    public void setServiceNowTicketNumber(String serviceNowTicketNumber) {
        this.serviceNowTicketNumber = serviceNowTicketNumber;
    }
}

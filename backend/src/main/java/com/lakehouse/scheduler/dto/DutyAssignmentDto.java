package com.lakehouse.scheduler.dto;

import com.lakehouse.scheduler.model.DutyAssignment;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class DutyAssignmentDto {
    private Long id;
    private LocalDate assignedDate;
    private LocalDate completedDate;
    private DutyAssignment.Status status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserDto user;
    private DutyDto duty;

    public DutyAssignmentDto() {}

    public DutyAssignmentDto(DutyAssignment assignment) {
        this.id = assignment.getId();
        this.assignedDate = assignment.getAssignedDate();
        this.completedDate = assignment.getCompletedDate();
        this.status = assignment.getStatus();
        this.notes = assignment.getNotes();
        this.createdAt = assignment.getCreatedAt();
        this.updatedAt = assignment.getUpdatedAt();
        
        // Convert related entities to DTOs
        if (assignment.getUser() != null) {
            this.user = new UserDto(assignment.getUser());
        }
        if (assignment.getDuty() != null) {
            this.duty = new DutyDto(assignment.getDuty());
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getAssignedDate() {
        return assignedDate;
    }

    public void setAssignedDate(LocalDate assignedDate) {
        this.assignedDate = assignedDate;
    }

    public LocalDate getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDate completedDate) {
        this.completedDate = completedDate;
    }

    public DutyAssignment.Status getStatus() {
        return status;
    }

    public void setStatus(DutyAssignment.Status status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }

    public DutyDto getDuty() {
        return duty;
    }

    public void setDuty(DutyDto duty) {
        this.duty = duty;
    }
}

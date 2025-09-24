package com.lakehouse.scheduler.dto;

import com.lakehouse.scheduler.model.Duty;
import java.time.LocalDateTime;

public class DutyDto {
    private Long id;
    private String name;
    private String description;
    private Integer estimatedHours;
    private Duty.Priority priority;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DutyDto() {}

    public DutyDto(Duty duty) {
        this.id = duty.getId();
        this.name = duty.getName();
        this.description = duty.getDescription();
        this.estimatedHours = duty.getEstimatedHours();
        this.priority = duty.getPriority();
        this.isActive = duty.getIsActive();
        this.createdAt = duty.getCreatedAt();
        this.updatedAt = duty.getUpdatedAt();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getEstimatedHours() {
        return estimatedHours;
    }

    public void setEstimatedHours(Integer estimatedHours) {
        this.estimatedHours = estimatedHours;
    }

    public Duty.Priority getPriority() {
        return priority;
    }

    public void setPriority(Duty.Priority priority) {
        this.priority = priority;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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
}

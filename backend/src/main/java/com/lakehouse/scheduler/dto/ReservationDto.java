package com.lakehouse.scheduler.dto;

import com.lakehouse.scheduler.model.Reservation;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReservationDto {
    private Long id;
    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;
    private Reservation.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserDto user;

    public ReservationDto() {}

    public ReservationDto(Reservation reservation) {
        this.id = reservation.getId();
        this.startDate = reservation.getStartDate();
        this.endDate = reservation.getEndDate();
        this.notes = reservation.getNotes();
        this.status = reservation.getStatus();
        this.createdAt = reservation.getCreatedAt();
        this.updatedAt = reservation.getUpdatedAt();
        
        // Convert related entity to DTO
        if (reservation.getUser() != null) {
            this.user = new UserDto(reservation.getUser());
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Reservation.Status getStatus() {
        return status;
    }

    public void setStatus(Reservation.Status status) {
        this.status = status;
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
}

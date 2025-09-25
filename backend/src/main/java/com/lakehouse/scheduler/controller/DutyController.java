package com.lakehouse.scheduler.controller;

import com.lakehouse.scheduler.dto.DutyAssignmentDto;
import com.lakehouse.scheduler.dto.DutyDto;
import com.lakehouse.scheduler.model.Duty;
import com.lakehouse.scheduler.model.DutyAssignment;
import com.lakehouse.scheduler.model.User;
import com.lakehouse.scheduler.repository.DutyAssignmentRepository;
import com.lakehouse.scheduler.repository.DutyRepository;
import com.lakehouse.scheduler.repository.UserRepository;
import com.lakehouse.scheduler.service.UserDetailsServiceImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/duties")
public class DutyController {


    @Autowired
    private DutyRepository dutyRepository;

    @Autowired
    private DutyAssignmentRepository dutyAssignmentRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<DutyDto>> getAllDuties() {
        List<Duty> duties = dutyRepository.findByIsActiveTrue();
        List<DutyDto> dutyDtos = duties.stream()
                .map(DutyDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dutyDtos);
    }

    @GetMapping("/assignments")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<DutyAssignmentDto>> getAllAssignments() {
        List<DutyAssignment> assignments = dutyAssignmentRepository.findAll();
        List<DutyAssignmentDto> assignmentDtos = assignments.stream()
                .map(DutyAssignmentDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(assignmentDtos);
    }

    @GetMapping("/assignments/my")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<DutyAssignmentDto>> getMyAssignments(Authentication authentication) {
        UserDetailsServiceImpl.UserPrincipal userPrincipal = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        List<DutyAssignment> assignments = dutyAssignmentRepository.findByUserId(userPrincipal.getId());
        List<DutyAssignmentDto> assignmentDtos = assignments.stream()
                .map(DutyAssignmentDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(assignmentDtos);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> createDuty(@Valid @RequestBody DutyRequest request) {
        Map<String, String> response = new HashMap<>();
        
        Duty duty = new Duty(request.getName(), request.getDescription(), request.getEstimatedHours(), request.getPriority());
        dutyRepository.save(duty);

        response.put("message", "Duty created successfully!");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{dutyId}/assign")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> assignDuty(@PathVariable Long dutyId, @Valid @RequestBody AssignmentRequest request, Authentication authentication) {
        Map<String, String> response = new HashMap<>();
                
        Optional<User> userOpt = userRepository.findById(request.getAssignedUserId());
        Optional<Duty> dutyOpt = dutyRepository.findById(dutyId);
        
        if (!userOpt.isPresent()) {
            response.put("message", "User not found");
            return ResponseEntity.badRequest().body(response);
        }

        if (!dutyOpt.isPresent()) {
            response.put("message", "Duty not found");
            return ResponseEntity.badRequest().body(response);
        }

        DutyAssignment assignment = new DutyAssignment(request.getAssignedDate(), userOpt.get(), dutyOpt.get());
        assignment.setNotes(request.getNotes());
        dutyAssignmentRepository.save(assignment);

        response.put("message", "Duty assigned successfully!");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/assignments/{id}/complete")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> completeAssignment(@PathVariable Long id, Authentication authentication) {
        Map<String, String> response = new HashMap<>();
        
        UserDetailsServiceImpl.UserPrincipal userPrincipal = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        Optional<DutyAssignment> assignmentOpt = dutyAssignmentRepository.findById(id);
        
        if (!assignmentOpt.isPresent()) {
            response.put("message", "Assignment not found");
            return ResponseEntity.badRequest().body(response);
        }

        DutyAssignment assignment = assignmentOpt.get();
        
        // Check if user owns the assignment or is admin
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        
        if (!assignment.getUser().getId().equals(userPrincipal.getId()) && !isAdmin) {
            response.put("message", "Not authorized to complete this assignment");
            return ResponseEntity.badRequest().body(response);
        }

        assignment.setStatus(DutyAssignment.Status.COMPLETED);
        assignment.setCompletedDate(LocalDate.now());
        dutyAssignmentRepository.save(assignment);

        response.put("message", "Assignment completed successfully!");
        return ResponseEntity.ok(response);
    }

    public static class DutyRequest {
        private String name;
        private String description;
        private Integer estimatedHours;
        private Duty.Priority priority;

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
    }

    public static class AssignmentRequest {
        private LocalDate assignedDate;
        private String notes;
        private Long assignedUserId;

        public LocalDate getAssignedDate() {
            return assignedDate;
        }

        public void setAssignedDate(LocalDate assignedDate) {
            this.assignedDate = assignedDate;
        }


        public void setAssignedUserId(Long uid) {
            this.assignedUserId = uid;
        }

        public Long getAssignedUserId() {
            return this.assignedUserId;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }
}

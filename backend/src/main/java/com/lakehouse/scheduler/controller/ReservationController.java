package com.lakehouse.scheduler.controller;

import com.lakehouse.scheduler.dto.ReservationDto;
import com.lakehouse.scheduler.model.Reservation;
import com.lakehouse.scheduler.model.User;
import com.lakehouse.scheduler.repository.ReservationRepository;
import com.lakehouse.scheduler.repository.UserRepository;
import com.lakehouse.scheduler.service.UserDetailsServiceImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/reservations")
public class ReservationController {
    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<ReservationDto>> getAllReservations() {
        List<Reservation> reservations = reservationRepository.findCurrentAndFutureReservations(LocalDate.now());
        List<ReservationDto> reservationDtos = reservations.stream()
                .map(ReservationDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reservationDtos);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<ReservationDto>> getMyReservations(Authentication authentication) {
        UserDetailsServiceImpl.UserPrincipal userPrincipal = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        List<Reservation> reservations = reservationRepository.findByUserId(userPrincipal.getId());
        List<ReservationDto> reservationDtos = reservations.stream()
                .map(ReservationDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reservationDtos);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> createReservation(@Valid @RequestBody ReservationRequest request, Authentication authentication) {
        Map<String, String> response = new HashMap<>();
        
        UserDetailsServiceImpl.UserPrincipal userPrincipal = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        Optional<User> userOpt = userRepository.findById(userPrincipal.getId());
        
        if (!userOpt.isPresent()) {
            response.put("message", "User not found");
            return ResponseEntity.badRequest().body(response);
        }

        // Check for overlapping reservations
        List<Reservation> overlapping = reservationRepository.findOverlappingReservations(request.getStartDate(), request.getEndDate());
        if (!overlapping.isEmpty()) {
            response.put("message", "Dates conflict with existing reservation");
            return ResponseEntity.badRequest().body(response);
        }

        Reservation reservation = new Reservation(request.getStartDate(), request.getEndDate(), request.getNotes(), userOpt.get());
        reservationRepository.save(reservation);

        response.put("message", "Reservation created successfully!");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteReservation(@PathVariable Long id, Authentication authentication) {
        Map<String, String> response = new HashMap<>();
        
        UserDetailsServiceImpl.UserPrincipal userPrincipal = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        Optional<Reservation> reservationOpt = reservationRepository.findById(id);
        
        if (!reservationOpt.isPresent()) {
            response.put("message", "Reservation not found");
            return ResponseEntity.badRequest().body(response);
        }

        Reservation reservation = reservationOpt.get();
        
        // Check if user owns the reservation or is admin
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        
        if (!reservation.getUser().getId().equals(userPrincipal.getId()) && !isAdmin) {
            response.put("message", "Not authorized to delete this reservation");
            return ResponseEntity.badRequest().body(response);
        }

        reservationRepository.delete(reservation);
        response.put("message", "Reservation deleted successfully!");
        return ResponseEntity.ok(response);
    }

    public static class ReservationRequest {
        private LocalDate startDate;
        private LocalDate endDate;
        private String notes;

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
    }
}

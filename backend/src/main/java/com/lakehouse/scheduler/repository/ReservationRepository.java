package com.lakehouse.scheduler.repository;

import com.lakehouse.scheduler.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(Long userId);
    
    @Query("SELECT r FROM Reservation r WHERE r.startDate <= :endDate AND r.endDate >= :startDate")
    List<Reservation> findOverlappingReservations(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT r FROM Reservation r WHERE r.endDate >= :currentDate ORDER BY r.startDate ASC")
    List<Reservation> findCurrentAndFutureReservations(@Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT r FROM Reservation r WHERE r.startDate >= :startDate AND r.endDate <= :endDate")
    List<Reservation> findReservationsBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}

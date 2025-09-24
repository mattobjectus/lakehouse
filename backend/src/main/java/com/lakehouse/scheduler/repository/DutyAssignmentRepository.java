package com.lakehouse.scheduler.repository;

import com.lakehouse.scheduler.model.DutyAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DutyAssignmentRepository extends JpaRepository<DutyAssignment, Long> {
    List<DutyAssignment> findByUserId(Long userId);
    List<DutyAssignment> findByDutyId(Long dutyId);
    List<DutyAssignment> findByStatus(DutyAssignment.Status status);
    
    @Query("SELECT da FROM DutyAssignment da WHERE da.assignedDate >= :startDate AND da.assignedDate <= :endDate")
    List<DutyAssignment> findAssignmentsBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT da FROM DutyAssignment da WHERE da.user.id = :userId AND da.status = :status")
    List<DutyAssignment> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") DutyAssignment.Status status);
}

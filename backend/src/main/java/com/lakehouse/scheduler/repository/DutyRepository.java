package com.lakehouse.scheduler.repository;

import com.lakehouse.scheduler.model.Duty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DutyRepository extends JpaRepository<Duty, Long>, DutyRepositoryCustom {
    List<Duty> findByIsActiveTrue();
    List<Duty> findByPriority(Duty.Priority priority);    
}

package com.lakehouse.scheduler.repository;

import com.lakehouse.scheduler.model.Duty;
import java.util.List;

public interface DutyRepositoryCustom {
    List<Duty> findDutiesWithAssignmentCount();
    List<Duty> findDutiesByPriorityAndStatus(Duty.Priority priority, Boolean isActive);
    List<Duty> findOverdueDuties();
    List<Duty> searchDutiesByNameOrDescription(String searchTerm);
    List<Duty> findByIsActiveTrue();
    List<Duty> findByPriority(Duty.Priority priority);    

}

package com.lakehouse.scheduler.repository;

import com.lakehouse.scheduler.model.Duty;
import com.lakehouse.scheduler.model.Duty.Priority;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public class DutyRepositoryImpl implements DutyRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<Duty> findDutiesWithAssignmentCount() {
        String jpql = "SELECT DISTINCT d FROM Duty d LEFT JOIN FETCH d.assignments WHERE d.isActive = true ORDER BY d.priority DESC, d.createdAt DESC";
        TypedQuery<Duty> query = entityManager.createQuery(jpql, Duty.class);
        return query.getResultList();
    }

    @Override
    public List<Duty> findDutiesByPriorityAndStatus(Duty.Priority priority, Boolean isActive) {
        String jpql = "SELECT d FROM Duty d WHERE d.priority = :priority AND d.isActive = :isActive ORDER BY d.createdAt DESC";
        TypedQuery<Duty> query = entityManager.createQuery(jpql, Duty.class);
        query.setParameter("priority", priority);
        query.setParameter("isActive", isActive);
        return query.getResultList();
    }

    @Override
    public List<Duty> findOverdueDuties() {
        String jpql = """
            SELECT DISTINCT d FROM Duty d 
            JOIN d.assignments da 
            WHERE d.isActive = true 
            AND da.status = com.lakehouse.scheduler.model.DutyAssignment.Status.ASSIGNED 
            AND da.assignedDate < :cutoffDate
            ORDER BY da.assignedDate ASC
            """;
        TypedQuery<Duty> query = entityManager.createQuery(jpql, Duty.class);
        // Consider duties overdue if assigned more than 7 days ago
        query.setParameter("cutoffDate", LocalDateTime.now().minusDays(7));
        return query.getResultList();
    }

    @Override
    public List<Duty> searchDutiesByNameOrDescription(String searchTerm) {
        String jpql = """
            SELECT d FROM Duty d 
            WHERE d.isActive = true 
            AND (LOWER(d.name) LIKE LOWER(:searchTerm) 
                 OR LOWER(d.description) LIKE LOWER(:searchTerm))
            ORDER BY d.priority DESC, d.name ASC
            """;
        TypedQuery<Duty> query = entityManager.createQuery(jpql, Duty.class);
        query.setParameter("searchTerm", "%" + searchTerm + "%");
        return query.getResultList();
    }

  

    @Override
    public List<Duty> findByIsActiveTrue() {
        String jpql = "SELECT d FROM Duty d WHERE d.isActive = :isActive ORDER BY d.createdAt DESC";
        TypedQuery<Duty> query = entityManager.createQuery(jpql, Duty.class);
        query.setParameter("isActive", true);
        return query.getResultList();
    }

    @Override
    public List<Duty> findByPriority(Priority priority) {
        String jpql = "SELECT d FROM Duty d WHERE d.priority = :priority AND d.isActive = :isActive ORDER BY d.createdAt DESC";
        TypedQuery<Duty> query = entityManager.createQuery(jpql, Duty.class);
        query.setParameter("priority", priority);
        query.setParameter("isActive", true);
        return query.getResultList();

    }
}

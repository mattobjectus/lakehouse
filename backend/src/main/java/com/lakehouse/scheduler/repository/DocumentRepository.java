package com.lakehouse.scheduler.repository;

import com.lakehouse.scheduler.model.Document;
import com.lakehouse.scheduler.model.User;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public interface DocumentRepository extends JpaRepository<Document, Long> {
    
    List<Document> findByUploadedByOrderByUploadedAtDesc(User uploadedBy);
    
    List<Document> findAllByOrderByUploadedAtDesc();
    
    @Query("SELECT d FROM Document d WHERE d.originalFileName LIKE %:filename%")
    List<Document> findByOriginalFileNameContaining(@Param("filename") String filename);
    
    @Query("SELECT d FROM Document d WHERE d.contentType = :contentType")
    List<Document> findByContentType(@Param("contentType") String contentType);


}

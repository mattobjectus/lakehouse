package com.lakehouse.scheduler.dto;

import com.lakehouse.scheduler.model.Document;
import java.time.LocalDateTime;

public class DocumentDto {
    private Long id;
    private String fileName;
    private String originalFileName;
    private String contentType;
    private String fileExtension;
    private Long fileSize;
    private LocalDateTime uploadedAt;
    private String uploadedByUsername;
    private String uploadedByName;
    private String description;

    // Constructors
    public DocumentDto() {}

    public DocumentDto(Document document) {
        this.id = document.getId();
        this.fileName = document.getFileName();
        this.originalFileName = document.getOriginalFileName();
        this.contentType = document.getContentType();
        this.fileExtension = document.getFileExtension();
        this.fileSize = document.getFileSize();
        this.uploadedAt = document.getUploadedAt();
        this.uploadedByUsername = document.getUploadedBy().getUsername();
        this.uploadedByName = document.getUploadedBy().getFirstName() + " " + document.getUploadedBy().getLastName();
        this.description = document.getDescription();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getFileExtension() {
        return fileExtension;
    }

    public void setFileExtension(String fileExtension) {
        this.fileExtension = fileExtension;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public String getUploadedByUsername() {
        return uploadedByUsername;
    }

    public void setUploadedByUsername(String uploadedByUsername) {
        this.uploadedByUsername = uploadedByUsername;
    }

    public String getUploadedByName() {
        return uploadedByName;
    }

    public void setUploadedByName(String uploadedByName) {
        this.uploadedByName = uploadedByName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // Helper method to format file size
    public String getFormattedFileSize() {
        if (fileSize == null) return "0 B";
        
        long bytes = fileSize;
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
        return String.format("%.1f GB", bytes / (1024.0 * 1024.0 * 1024.0));
    }
}

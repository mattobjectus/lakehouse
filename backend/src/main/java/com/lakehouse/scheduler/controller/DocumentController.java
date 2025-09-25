package com.lakehouse.scheduler.controller;

import com.lakehouse.scheduler.dto.DocumentDto;
import com.lakehouse.scheduler.model.Document;
import com.lakehouse.scheduler.model.User;
import com.lakehouse.scheduler.repository.DocumentRepository;
import com.lakehouse.scheduler.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/documents")
public class DocumentController {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            Authentication authentication) {
        
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select a file to upload");
            }

            // Check file size (limit to 10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("File size must be less than 10MB");
            }

            // Get current user
            String username = authentication.getName();
            Optional<User> userOptional = userRepository.findByUsername(username);
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            User user = userOptional.get();

            // Generate unique filename
            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

            // Create document entity
            Document document = new Document(
                uniqueFileName,
                originalFileName,
                file.getContentType(),
                fileExtension,
                file.getSize(),
                file.getBytes(),
                user,
                description
            );

            // Save to database
            Document savedDocument = documentRepository.save(document);

            return ResponseEntity.ok(new DocumentDto(savedDocument));

        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Failed to upload file: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error uploading file: " + e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<DocumentDto>> getAllDocuments() {
        List<Document> documents = documentRepository.findAllByOrderByUploadedAtDesc();
        List<DocumentDto> documentDtos = documents.stream()
                .map(DocumentDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(documentDtos);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<DocumentDto>> getMyDocuments(Authentication authentication) {
        String username = authentication.getName();
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (!userOptional.isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        List<Document> documents = documentRepository.findByUploadedByOrderByUploadedAtDesc(userOptional.get());
        List<DocumentDto> documentDtos = documents.stream()
                .map(DocumentDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(documentDtos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<DocumentDto> getDocument(@PathVariable Long id) {
        Optional<Document> documentOptional = documentRepository.findById(id);
        if (!documentOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(new DocumentDto(documentOptional.get()));
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ByteArrayResource> downloadDocument(@PathVariable Long id) {
        Optional<Document> documentOptional = documentRepository.findById(id);
        if (!documentOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Document document = documentOptional.get();
        ByteArrayResource resource = new ByteArrayResource(document.getData());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                       "attachment; filename=\"" + document.getOriginalFileName() + "\"")
                .contentType(MediaType.parseMediaType(document.getContentType()))
                .contentLength(document.getFileSize())
                .body(resource);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> deleteDocument(@PathVariable Long id, Authentication authentication) {
        try {
            Optional<Document> documentOptional = documentRepository.findById(id);
            if (!documentOptional.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Document document = documentOptional.get();
            
            // Check if user is admin or the owner of the document
            String username = authentication.getName();
            Optional<User> userOptional = userRepository.findByUsername(username);
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            User currentUser = userOptional.get();
            boolean isAdmin = currentUser.isAdmin();
            boolean isOwner = document.getUploadedBy().getId().equals(currentUser.getId());
            
            if (!isAdmin && !isOwner) {
                return ResponseEntity.status(403).body("You can only delete your own documents");
            }

            documentRepository.deleteById(id);
            return ResponseEntity.ok().body("Document deleted successfully");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting document: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<DocumentDto>> searchDocuments(@RequestParam String filename) {
        List<Document> documents = documentRepository.findByOriginalFileNameContaining(filename);
        List<DocumentDto> documentDtos = documents.stream()
                .map(DocumentDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(documentDtos);
    }
}

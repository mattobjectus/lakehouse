package com.lakehouse.scheduler.controller;

import com.lakehouse.scheduler.dto.UserDto;
import com.lakehouse.scheduler.model.User;
import com.lakehouse.scheduler.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/users")
public class UserController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder encoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDto> userDtos = users.stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok().body(new UserDto(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getUsersByRole(@PathVariable String role) {
        try {
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            List<User> users = userRepository.findByRole(userRole);
            List<UserDto> userDtos = users.stream()
                    .map(UserDto::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(userDtos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> createUser(@RequestBody UserDto userDto) {
        try {
            // Check if username already exists
            if (userRepository.existsByUsername(userDto.getUsername())) {
                return ResponseEntity.badRequest().body("Error: Username is already taken!");
            }

            // Check if email already exists
            if (userRepository.existsByEmail(userDto.getEmail())) {
                return ResponseEntity.badRequest().body("Error: Email is already in use!");
            }

            // Validate password
            String password = userDto.getPassword();
            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Error: Password is required!");
            }
            
            if (password.length() < 6) {
                return ResponseEntity.badRequest().body("Error: Password must be at least 6 characters long!");
            }

            // Check password confirmation if provided
            if (userDto.getConfirmPassword() != null && !password.equals(userDto.getConfirmPassword())) {
                return ResponseEntity.badRequest().body("Error: Passwords do not match!");
            }

            // Create new user
            User user = new User(userDto.getUsername(), userDto.getEmail(), 
                               userDto.getFirstName(), userDto.getLastName(), 
                               encoder.encode(password));
            
            // Set role if provided
            if (userDto.getRole() != null && userDto.getRole() != null) {
                try {
                    user.setRole(User.Role.valueOf(userDto.getRole().name().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    user.setRole(User.Role.USER); // Default to USER if invalid role
                }
            }

            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(new UserDto(savedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating user: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserDto userDto) {
        try {
            Optional<User> userOptional = userRepository.findById(id);
            if (!userOptional.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOptional.get();
            
            // Update fields
            if (userDto.getUsername() != null && !userDto.getUsername().equals(user.getUsername())) {
                if (userRepository.existsByUsername(userDto.getUsername())) {
                    return ResponseEntity.badRequest().body("Error: Username is already taken!");
                }
                user.setUsername(userDto.getUsername());
            }
            
            if (userDto.getEmail() != null && !userDto.getEmail().equals(user.getEmail())) {
                if (userRepository.existsByEmail(userDto.getEmail())) {
                    return ResponseEntity.badRequest().body("Error: Email is already in use!");
                }
                user.setEmail(userDto.getEmail());
            }
            
            if (userDto.getFirstName() != null) {
                try {
                user.setFirstName(userDto.getFirstName());
                } catch (Throwable t) {
                    System.out.println("***********************************************");
                    t.printStackTrace();
                    System.out.println("***********************************************");
                }
            }
            
            if (userDto.getLastName() != null) {
                user.setLastName(userDto.getLastName());
            }
            
            // Handle password update
            if (userDto.getPassword() != null && !userDto.getPassword().trim().isEmpty()) {
                String password = userDto.getPassword();
                
                if (password.length() < 6) {
                    return ResponseEntity.badRequest().body("Error: Password must be at least 6 characters long!");
                }

                // Check password confirmation if provided
                if (userDto.getConfirmPassword() != null && !password.equals(userDto.getConfirmPassword())) {
                    return ResponseEntity.badRequest().body("Error: Passwords do not match!");
                }
                
                user.setPassword(encoder.encode(password));
            }
            
            if (userDto.getRole() != null && userDto.getRole() != null) {
                try {
                    user.setRole(User.Role.valueOf(userDto.getRole().name().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body("Error: Invalid role specified!");
                }
            }

            User updatedUser = userRepository.save(user);
            return ResponseEntity.ok(new UserDto(updatedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating user: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            if (!userRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            userRepository.deleteById(id);
            return ResponseEntity.ok().body("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting user: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody String role) {
        try {
            Optional<User> userOptional = userRepository.findById(id);
            if (!userOptional.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOptional.get();
            
            try {
                user.setRole(User.Role.valueOf(role.toUpperCase()));
                User updatedUser = userRepository.save(user);
                return ResponseEntity.ok(new UserDto(updatedUser));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Error: Invalid role specified!");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating user role: " + e.getMessage());
        }
    }
}

package com.lakehouse.scheduler.controller;

import com.lakehouse.scheduler.config.JwtUtils;
import com.lakehouse.scheduler.dto.JwtResponse;
import com.lakehouse.scheduler.dto.LoginRequest;
import com.lakehouse.scheduler.dto.SignupRequest;
import com.lakehouse.scheduler.model.User;
import com.lakehouse.scheduler.repository.UserRepository;
import com.lakehouse.scheduler.service.UserDetailsServiceImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {


        System.out.println("LOGGING IN");
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsServiceImpl.UserPrincipal userDetails = (UserDetailsServiceImpl.UserPrincipal) authentication.getPrincipal();
        
        // Get user from database to get additional info
        User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
        
        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                user != null ? user.getFirstName() : "",
                user != null ? user.getLastName() : "",
                userDetails.getAuthorities().iterator().next().getAuthority()));
    }

    @PostMapping("/signup")
    @Transactional
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        Map<String, String> response = new HashMap<>();

        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            response.put("message", "Error: Username is already taken!");
            return ResponseEntity.badRequest().body(response);
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            response.put("message", "Error: Email is already in use!");
            return ResponseEntity.badRequest().body(response);
        }

        // Create new user's account
        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                signUpRequest.getFirstName(),
                signUpRequest.getLastName(),
                encoder.encode(signUpRequest.getPassword()));

        userRepository.save(user);

        response.put("message", "User registered successfully!");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/make-admin/{username}")
    @Transactional
    public ResponseEntity<?> makeUserAdmin(@PathVariable String username) {
        Map<String, String> response = new HashMap<>();
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (!userOpt.isPresent()) {
            response.put("message", "User not found");
            return ResponseEntity.badRequest().body(response);
        }
        
        User user = userOpt.get();
        user.setRole(User.Role.ADMIN);
        userRepository.save(user);
        
        response.put("message", "User role updated to ADMIN successfully!");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/init-admin")
    @Transactional
    public ResponseEntity<?> initializeAdmin() {
        Map<String, String> response = new HashMap<>();
        
        Optional<User> userOpt = userRepository.findByUsername("admin");
        if (!userOpt.isPresent()) {
            response.put("message", "Admin user not found");
            return ResponseEntity.badRequest().body(response);
        }
        
        User user = userOpt.get();
        user.setRole(User.Role.ADMIN);
        userRepository.save(user);
        
        response.put("message", "Admin user initialized successfully!");
        return ResponseEntity.ok(response);
    }
}

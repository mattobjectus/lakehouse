package com.lakehouse.scheduler.repository;

import com.lakehouse.scheduler.model.User;

import java.util.List;
import java.util.Optional;

public interface UserRepositoryCustom {
    List<User> findByRole(User.Role role);
    List<User> findActiveUsers();
    Optional<User> findByUsernameOrEmail(String usernameOrEmail);
    List<User> searchByName(String searchTerm);
}

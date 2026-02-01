package com.example.springproject.repository;

import com.example.springproject.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface Usersrepository extends JpaRepository<Users, Integer> {
    Optional<Users> findByUsername(String username);
    boolean existsByUsername(String username);
}

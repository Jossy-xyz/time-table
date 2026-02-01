package com.example.springproject.service;

import com.example.springproject.model.Users;
import com.example.springproject.repository.Usersrepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class Userserviceimp implements Userservice {
    
    @Autowired
    private Usersrepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public Users saveUser(Users user) {
        // Encode password before saving
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) { // Simple check to avoid double hashing
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    @Override
    public Users getUserByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElse(null);
    }

    @Override
    public List<Users> getAllUsers() {
        return userRepository.findAll();
    }
}

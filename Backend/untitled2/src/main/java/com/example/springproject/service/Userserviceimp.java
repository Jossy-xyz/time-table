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

    @Autowired
    private PolicyEnforcementService policyService;

    @Override
    @Transactional
    public Users saveUser(Users user, String actorUsername) {
        // DIV-01: PEL Integration
        // Special case: If no users exist, allow first registration
        if (userRepository.count() > 0) {
            policyService.enforceScope(
                actorUsername, 
                user.getDepartment() != null ? user.getDepartment().getId() : null,
                user.getCollege() != null ? user.getCollege().getId() : null
            );
            
            // Further restriction: Only AD and CR can manage users
            Users actor = userRepository.findByUsername(actorUsername).orElse(null);
            if (actor != null && actor.getRole() != null) {
                String role = actor.getRole().getCode();
                if (!"AD".equalsIgnoreCase(role) && !"CR".equalsIgnoreCase(role)) {
                    throw new RuntimeException("ACCESS-DENIED: Only Admin or College Rep can manage users.");
                }
            }
        }

        // DIV-02: Sanitization - Encode password before saving
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
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

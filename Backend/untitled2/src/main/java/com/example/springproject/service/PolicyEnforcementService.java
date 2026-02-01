package com.example.springproject.service;

import com.example.springproject.model.Users;
import com.example.springproject.repository.Usersrepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PolicyEnforcementService {

    @Autowired
    private Usersrepository userRepository;

    /**
     * Verifies if an actor has the scope to perform an operation on a target.
     * 
     * @param actorUsername The username of the person performing the action
     * @param targetDeptId The department ID associated with the data being accessed
     * @param targetCollegeId The college/centre ID associated with the data
     * @return true if authorized, false otherwise
     */
    public boolean checkScope(String actorUsername, Integer targetDeptId, Integer targetCollegeId) {
        Users actor = userRepository.findByUsername(actorUsername).orElse(null);
        
        if (actor == null) {
            System.err.println("Policy Enforcement Error: Actor not found - " + actorUsername);
            return false;
        }

        if (actor.getRole() == null) return false;
        String role = actor.getRole().getCode();

        // 1. ADMIN: Global Scope
        if ("AD".equalsIgnoreCase(role)) {
            return true;
        }

        // 2. COLLEGE REP: Scope restricted to their college
        if ("CR".equalsIgnoreCase(role)) {
            if (actor.getCollege() == null) return false;
            return actor.getCollege().getId().equals(targetCollegeId);
        }

        // 3. DEPT REP: Scope restricted to their department
        if ("DR".equalsIgnoreCase(role)) {
            if (actor.getDepartment() == null) return false;
            return actor.getDepartment().getId().equals(targetDeptId);
        }

        // 4. STAFF: Scope restricted to their department
        if ("ST".equalsIgnoreCase(role)) {
            if (actor.getDepartment() == null) return false;
            return actor.getDepartment().getId().equals(targetDeptId);
        }

        return false;
    }

    public void enforceScope(String actorUsername, Integer targetDeptId, Integer targetCollegeId) {
        if (!checkScope(actorUsername, targetDeptId, targetCollegeId)) {
            throw new RuntimeException("Access Denied: You do not have permission to access/modify data in this scope.");
        }
    }
}

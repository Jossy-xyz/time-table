package com.example.springproject.service;

import com.example.springproject.model.Users;
import com.example.springproject.model.Department;
import com.example.springproject.repository.Usersrepository;
import com.example.springproject.repository.Departmentrepository;
import com.example.springproject.exception.AccessDeniedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class PolicyEnforcementService {

    @Autowired
    private Usersrepository userRepository;

    @Autowired
    private Departmentrepository departmentRepository;

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
            Integer actorCollegeId = actor.getCollege().getId();

            // Direct college match
            if (targetCollegeId != null && actorCollegeId.equals(targetCollegeId)) {
                return true;
            }

            // Indirect match: Department belongs to actor's college
            if (targetDeptId != null) {
                return departmentRepository.findById(targetDeptId)
                    .map(dept -> dept.getCentre() != null && dept.getCentre().getId().equals(actorCollegeId))
                    .orElse(false);
            }
            
            return false;
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
            throw new AccessDeniedException("You do not have permission to access/modify data in this scope.");
        }
    }

    /**
     * Enforces that only ADMIN (AD) and COLLEGE REP (CR) can access venue operations.
     * Department Reps (DR) and Staff (ST) are explicitly denied.
     */
    public void enforceVenueAccess(String actorUsername) {
        Users actor = userRepository.findByUsername(actorUsername).orElse(null);
        
        if (actor == null || actor.getRole() == null) {
            throw new RuntimeException("Access Denied: Invalid user or role.");
        }

        String role = actor.getRole().getCode();
        
        if ("AD".equalsIgnoreCase(role) || "CR".equalsIgnoreCase(role)) {
            return; // Access granted
        }
        
        throw new AccessDeniedException("Venue operations are restricted to Admin and College Representatives only.");
    }

    /**
     * Enforces that only ADMIN (AD) can trigger the timetable generation algorithm.
     * All other roles (CR, DR, ST) are explicitly denied.
     */
    public void enforceAlgorithmAccess(String actorUsername) {
        Users actor = userRepository.findByUsername(actorUsername).orElse(null);
        
        if (actor == null || actor.getRole() == null) {
            throw new RuntimeException("Access Denied: Invalid user or role.");
        }

        String role = actor.getRole().getCode();
        
        if ("AD".equalsIgnoreCase(role)) {
            return; // Access granted
        }
        
        throw new AccessDeniedException("Timetable generation is restricted to Administrators only.");
    }
}

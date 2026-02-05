package com.example.springproject.repository;

import com.example.springproject.model.Staff;
import com.example.springproject.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface Staffrepository extends JpaRepository<Staff, Integer> {
    List<Staff> findByDepartment(Department department);
    List<Staff> findByDepartmentCentreId(Integer centreId);
    boolean existsByStaffId(String staffId);
}

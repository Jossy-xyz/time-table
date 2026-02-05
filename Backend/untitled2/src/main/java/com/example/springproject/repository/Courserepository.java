package com.example.springproject.repository;

import com.example.springproject.model.Course;
import com.example.springproject.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface Courserepository extends JpaRepository<Course, Integer> {
    List<Course> findByDepartment(Department department);
    List<Course> findByDepartmentCentreId(Integer centreId);
    Optional<Course> findByCode(String code);
    boolean existsByCode(String code);
}

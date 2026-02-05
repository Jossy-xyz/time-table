package com.example.springproject.repository;

import com.example.springproject.model.Student;
import com.example.springproject.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface Studentrepository extends JpaRepository<Student, Integer> {
    List<Student> findByDepartment(Department department);
    List<Student> findByDepartmentCentreId(Integer centreId);
    Optional<Student> findByMatricNo(String matricNo);
    boolean existsByMatricNo(String matricNo);
}

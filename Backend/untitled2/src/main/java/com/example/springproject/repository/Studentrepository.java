package com.example.springproject.repository;

import com.example.springproject.model.Student;
import com.example.springproject.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface Studentrepository extends JpaRepository<Student, String> {
    List<Student> findByDepartment(Department department);
    List<Student> findByCollegeId(Integer collegeId);
    Student findByMatricNo(String matricNo);
    boolean existsByMatricNo(String matricNo);
}

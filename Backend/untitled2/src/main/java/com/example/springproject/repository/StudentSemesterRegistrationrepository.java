package com.example.springproject.repository;

import com.example.springproject.model.StudentSemesterRegistration;
import com.example.springproject.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentSemesterRegistrationrepository extends JpaRepository<StudentSemesterRegistration, Long> {
    Optional<StudentSemesterRegistration> findByStudentAndSessionAndSemester(Student student, String session, Integer semester);
    boolean existsByStudentAndSessionAndSemester(Student student, String session, Integer semester);
}

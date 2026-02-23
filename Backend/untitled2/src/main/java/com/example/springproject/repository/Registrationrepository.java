package com.example.springproject.repository;

import com.example.springproject.model.Registration;
import com.example.springproject.model.Student;
import com.example.springproject.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface Registrationrepository extends JpaRepository<Registration, Long> {
    List<Registration> findByStudentAndSessionAndSemester(Student student, String session, Integer semester);
    List<Registration> findByCourseAndSessionAndSemester(Course course, String session, Integer semester);
    List<Registration> findByCollegeId(Integer collegeId);
    boolean existsByStudentAndCourseAndSessionAndSemester(Student student, Course course, String session, Integer semester);
}

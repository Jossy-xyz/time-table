package com.example.springproject.service;

import com.example.springproject.model.Student;
import com.example.springproject.model.Department;
import java.util.List;

public interface Studentservice {
     Student saveStudent(Student student, String actorUsername);
     List<Student> getAllStudents();
     List<Student> getStudentsByDepartment(Department department);
     List<Student> getStudentsByCollege(Integer collegeId);
     Student updateStudent(Integer id, Student updatedStudent, String actorUsername);
     void deleteStudent(Integer id, String actorUsername);
}

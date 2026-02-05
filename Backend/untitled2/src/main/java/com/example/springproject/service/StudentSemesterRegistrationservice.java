package com.example.springproject.service;

import com.example.springproject.model.StudentSemesterRegistration;
import java.util.List;

public interface StudentSemesterRegistrationservice {
    StudentSemesterRegistration saveStudentSemesterRegistration(StudentSemesterRegistration registration, String actorUsername);
    List<StudentSemesterRegistration> getAllStudentSemesterRegistrations();
    StudentSemesterRegistration updateStudentSemesterRegistration(Long id, StudentSemesterRegistration registration, String actorUsername);
    void deleteStudentSemesterRegistration(Long id, String actorUsername);
}

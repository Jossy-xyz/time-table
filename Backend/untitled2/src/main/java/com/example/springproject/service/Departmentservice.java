package com.example.springproject.service;

import com.example.springproject.model.Course;
import com.example.springproject.model.Department;

import java.util.List;

public interface Departmentservice {
    Department saveDepartment(Department department, String actorUsername);
    List<Department> getAllDepartments();
    Department updateDepartment(int id, Department updateDepartment, String actorUsername);
    void deleteDepartment(int id, String actorUsername);
}

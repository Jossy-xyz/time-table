package com.example.springproject.service;

import com.example.springproject.model.Department;
import com.example.springproject.repository.Departmentrepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class Departmentserviceimp implements Departmentservice {
    @Autowired
    private Departmentrepository departmentrepository;

    @Override
    public Department saveDepartment(Department department) {
        return departmentrepository.save(department);
    }

    @Override
    public List<Department> getAllDepartments() {
        return departmentrepository.findAll();
    }

    @Override
    public Department updateDepartment(int id, Department updatedDepartment) {
        Optional<Department> optional = departmentrepository.findById(id);
        if (optional.isPresent()) {
            Department existing = optional.get();
            existing.setCode(updatedDepartment.getCode());
            existing.setName(updatedDepartment.getName());
            existing.setCentre(updatedDepartment.getCentre());
            return departmentrepository.save(existing);
        }
        throw new RuntimeException("Department not found");
    }

    @Override
    public void deleteDepartment(int id) {
        departmentrepository.deleteById(id);
    }
}

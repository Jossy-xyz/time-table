package com.example.springproject.service;

import com.example.springproject.model.Staff;
import com.example.springproject.model.Department;
import java.util.List;

public interface Staffservice {
     Staff saveStaff(Staff staff, String actorUsername);
     List<Staff> getAllStaff();
     List<Staff> getStaffByDepartment(Department department);
     List<Staff> getStaffByCollege(Integer collegeId);
     Staff updateStaff(Integer id, Staff updatedStaff, String actorUsername);
     void deleteStaff(Integer id, String actorUsername);
}

package com.example.springproject.dto;

/**
 * DTO for login response - excludes sensitive password field
 * and only includes necessary user info.
 */
public class LoginResponse {
    private Integer id;
    private String username;
    private Integer roleId;
    private String roleCode;
    private Integer collegeId;
    private Integer departmentId;

    public LoginResponse(Integer id, String username, Integer roleId, String roleCode, Integer collegeId, Integer departmentId) {
        this.id = id;
        this.username = username;
        this.roleId = roleId;
        this.roleCode = roleCode;
        this.collegeId = collegeId;
        this.departmentId = departmentId;
    }

    // ... (id methods same)

    public Integer getRoleId() {
        return roleId;
    }

    public void setRoleId(Integer roleId) {
        this.roleId = roleId;
    }

    public String getRoleCode() {
        return roleCode;
    }

    public void setRoleCode(String roleCode) {
        this.roleCode = roleCode;
    }

    public Integer getCollegeId() {
        return collegeId;
    }

    public void setCollegeId(Integer collegeId) {
        this.collegeId = collegeId;
    }

    public Integer getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Integer departmentId) {
        this.departmentId = departmentId;
    }
}

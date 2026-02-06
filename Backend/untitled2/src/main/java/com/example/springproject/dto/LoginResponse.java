package com.example.springproject.dto;

/**
 * DTO for login response - excludes sensitive password field
 * and only includes necessary user info.
 */
public class LoginResponse {
    private Integer id;
    private String username;
    private String email;
    private Integer roleId;
    private String roleCode;
    private Integer collegeId;
    private Integer departmentId;

    public LoginResponse(Integer id, String username, String email, Integer roleId, String roleCode, Integer collegeId, Integer departmentId) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.roleId = roleId;
        this.roleCode = roleCode;
        this.collegeId = collegeId;
        this.departmentId = departmentId;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

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

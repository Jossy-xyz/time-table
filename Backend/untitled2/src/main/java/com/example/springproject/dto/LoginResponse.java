package com.example.springproject.dto;

/**
 * DTO for login response - excludes sensitive password field
 * and only includes necessary user info.
 */
public class LoginResponse {
    private Integer id;
    private String username;
    private Integer roleId;
    private String roleName;
    private Integer collegeId;
    private Integer departmentId;

    public LoginResponse(Integer id, String username, Integer roleId, String roleName, Integer collegeId, Integer departmentId) {
        this.id = id;
        this.username = username;
        this.roleId = roleId;
        this.roleName = roleName;
        this.collegeId = collegeId;
        this.departmentId = departmentId;
    }

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

    public Integer getRoleId() {
        return roleId;
    }

    public void setRoleId(Integer roleId) {
        this.roleId = roleId;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
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

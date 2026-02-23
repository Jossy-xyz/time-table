package com.example.springproject.service;

import com.example.springproject.model.Users;
import java.util.List;

public interface Userservice {
    Users saveUser(Users user, String actorUsername);
    Users getUserByUsername(String username);
    List<Users> getAllUsers();
}

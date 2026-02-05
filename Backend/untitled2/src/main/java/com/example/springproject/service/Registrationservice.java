package com.example.springproject.service;

import com.example.springproject.model.Registration;
import java.util.List;

public interface Registrationservice {
    Registration saveRegistration(Registration registration, String actorUsername);
    List<Registration> getAllRegistration();
    Registration updateRegistration(Long id, Registration updatedRegistration, String actorUsername);
    void deleteRegistration(Long id, String actorUsername);
}

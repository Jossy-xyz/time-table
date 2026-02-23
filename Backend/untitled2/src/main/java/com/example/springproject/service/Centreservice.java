package com.example.springproject.service;

import com.example.springproject.model.Centre;
import java.util.List;

public interface Centreservice {
   Centre saveCentre(Centre centre, String actorUsername);
   List<Centre> getAllCentres();
   Centre updateCentre(Integer id, Centre updatedCentre, String actorUsername);
   void deleteCentre(Integer id, String actorUsername);
}

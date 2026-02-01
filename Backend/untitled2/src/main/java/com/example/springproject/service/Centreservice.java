package com.example.springproject.service;

import com.example.springproject.model.Centre;
import java.util.List;

public interface Centreservice {
   Centre saveCentre(Centre centre);
   List<Centre> getAllCentres();
   Centre updateCentre(Integer id, Centre updatedCentre);
   void deleteCentre(Integer id);
}

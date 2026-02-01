package com.example.springproject.service;

import com.example.springproject.model.Venue;
import java.util.List;

public interface Venueservice {
    Venue saveVenue(Venue venue, String actorUsername);
    List<Venue> getAllVenues();
    Venue updateVenue(Integer id, Venue updatedVenue, String actorUsername);
    void deleteVenue(Integer id, String actorUsername);
}

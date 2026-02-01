package com.example.springproject.repository;

import com.example.springproject.model.Venue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface Venuerepository extends JpaRepository<Venue, Integer> {
}

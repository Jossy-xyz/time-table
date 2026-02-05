package com.example.springproject.service;

import com.example.springproject.model.Centre;
import com.example.springproject.repository.Centrerepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class Centreserviceimp implements Centreservice {
    @Autowired
    private Centrerepository centreRepository;

    @Override
    public Centre saveCentre(Centre centre) {
        return centreRepository.save(centre);
    }

    @Override
    public List<Centre> getAllCentres() {
        return centreRepository.findAll();
    }

    @Override
    public Centre updateCentre(Integer id, Centre updatedCentre) {
        Optional<Centre> optional = centreRepository.findById(id);
        if (optional.isPresent()) {
            Centre existing = optional.get();
            existing.setCode(updatedCentre.getCode());
            existing.setType(updatedCentre.getType());
            existing.setName(updatedCentre.getName());
            existing.setState(updatedCentre.getState());
            return centreRepository.save(existing);
        }
        throw new RuntimeException("Centre not found");
    }

    @Override
    public void deleteCentre(Integer id) {
        centreRepository.deleteById(id);
    }
}

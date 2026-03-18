package com.ragul.moviedb.repository;

import com.ragul.moviedb.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    Optional<Movie> findByImdbId(String imdbId);
    List<Movie> findByCategoryContainingIgnoreCaseOrderByTitleAsc(String category);
}

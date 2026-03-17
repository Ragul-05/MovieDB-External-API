package com.ragul.moviedb.repository;

import com.ragul.moviedb.model.AiInsight;
import com.ragul.moviedb.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AiInsightRepository extends JpaRepository<AiInsight, Long> {
    Optional<AiInsight> findByMovie(Movie movie);
    Optional<AiInsight> findByMovieImdbId(String imdbId);
}

package com.ragul.moviedb.repository;

import com.ragul.moviedb.model.Favorite;
import com.ragul.moviedb.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUser(User user);
    boolean existsByUserAndMovieImdbId(User user, String imdbId);
    Optional<Favorite> findByUserAndMovieImdbId(User user, String imdbId);
}

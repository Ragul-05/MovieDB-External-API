package com.ragul.moviedb.service;

import com.ragul.moviedb.model.Favorite;
import com.ragul.moviedb.model.Movie;
import com.ragul.moviedb.model.User;
import com.ragul.moviedb.repository.FavoriteRepository;
import com.ragul.moviedb.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final MovieService movieService;

    public Favorite addFavorite(String imdbId, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();

        Favorite existingFavorite = favoriteRepository.findByUserAndMovieImdbId(user, imdbId).orElse(null);
        if (existingFavorite != null) {
            return existingFavorite;
        }

        Movie movie = movieService.getMovieDetails(imdbId);
        if (movie == null) {
            return null;
        }

        Favorite favorite = Favorite.builder()
                .user(user)
                .movie(movie)
                .build();
        
        return favoriteRepository.save(favorite);
    }

    public List<Favorite> getFavorites(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        return favoriteRepository.findByUser(user);
    }

    public void removeFavorite(Long favoriteId, String userEmail) {
        Favorite favorite = favoriteRepository.findById(favoriteId).orElseThrow();
        if (favorite.getUser().getEmail().equals(userEmail)) {
            favoriteRepository.delete(favorite);
        }
    }
}

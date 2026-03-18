package com.ragul.moviedb.controller;

import com.ragul.moviedb.dto.OmdbSearchResponse;
import com.ragul.moviedb.dto.TrailerResponse;
import com.ragul.moviedb.model.Movie;
import com.ragul.moviedb.service.MovieService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/movies")
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @GetMapping
    public ResponseEntity<OmdbSearchResponse> searchMovies(@RequestParam String name) {
        String userEmail = null;
        Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
            userEmail = userDetails.getUsername();
        }
        return ResponseEntity.ok(movieService.searchMovies(name, userEmail));
    }

    @GetMapping("/{imdbId}")
    public ResponseEntity<Movie> getMovieDetails(@PathVariable String imdbId) {
        Movie movie = movieService.getMovieDetails(imdbId);
        if (movie == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(movie);
    }

    @GetMapping("/{imdbId}/trailer")
    public ResponseEntity<TrailerResponse> getMovieTrailer(@PathVariable String imdbId) {
        Optional<String> trailerUrl = movieService.getTrailerUrl(imdbId);
        return trailerUrl
                .map(url -> ResponseEntity.ok(new TrailerResponse(url)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Movie>> getMoviesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(movieService.getMoviesByCategory(category));
    }

    @GetMapping("/categories")
    public ResponseEntity<Map<String, List<Movie>>> getMoviesByCategories() {
        return ResponseEntity.ok(movieService.getMoviesGroupedByCategory());
    }
}

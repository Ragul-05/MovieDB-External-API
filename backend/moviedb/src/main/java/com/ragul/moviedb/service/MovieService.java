package com.ragul.moviedb.service;

import com.ragul.moviedb.dto.OmdbMovieDetail;
import com.ragul.moviedb.dto.OmdbSearchResponse;
import com.ragul.moviedb.model.Movie;
import com.ragul.moviedb.model.SearchHistory;
import com.ragul.moviedb.model.User;
import com.ragul.moviedb.repository.MovieRepository;
import com.ragul.moviedb.repository.SearchHistoryRepository;
import com.ragul.moviedb.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Optional;

@Service
@Slf4j
public class MovieService {

    private final MovieRepository movieRepository;
    private final SearchHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${omdb.api.key}")
    private String apiKey;

    private static final String OMDB_URL = "http://www.omdbapi.com/";

    public MovieService(MovieRepository movieRepository, SearchHistoryRepository historyRepository, UserRepository userRepository) {
        this.movieRepository = movieRepository;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
        this.restTemplate = new RestTemplate();
    }

    public OmdbSearchResponse searchMovies(String name, String userEmail) {
        if (userEmail != null) {
            userRepository.findByEmail(userEmail).ifPresent(user -> {
                historyRepository.save(SearchHistory.builder()
                        .user(user)
                        .searchQuery(name)
                        .build());
            });
        }
        String url = String.format("%s?apikey=%s&s=%s", OMDB_URL, apiKey, name);
        return restTemplate.getForObject(url, OmdbSearchResponse.class);
    }

    public Movie getMovieDetails(String imdbId) {
        Optional<Movie> existingMovie = Optional.empty();
        try {
            existingMovie = movieRepository.findByImdbId(imdbId);
        } catch (Exception ex) {
            log.warn("Failed to read cached movie {} from database: {}", imdbId, ex.getMessage());
        }

        if (existingMovie.isPresent() && hasFullDetails(existingMovie.get())) {
            return existingMovie.get();
        }

        String url = String.format("%s?apikey=%s&i=%s", OMDB_URL, apiKey, imdbId);
        OmdbMovieDetail omdbDetail = restTemplate.getForObject(url, OmdbMovieDetail.class);

        if (omdbDetail == null || "False".equalsIgnoreCase(omdbDetail.getResponse())) {
            return existingMovie.orElse(null);
        }

        Movie movie = existingMovie.orElseGet(Movie::new);
        applyOmdbDetails(movie, omdbDetail);
        try {
            return movieRepository.save(movie);
        } catch (Exception ex) {
            log.warn("Failed to cache movie {} in database, returning API data only: {}", imdbId, ex.getMessage());
            return movie;
        }
    }

    private boolean hasFullDetails(Movie movie) {
        return movie.getRuntime() != null
                && movie.getDirector() != null
                && movie.getActors() != null
                && movie.getImdbRating() != null;
    }

    private void applyOmdbDetails(Movie movie, OmdbMovieDetail omdbDetail) {
        movie.setImdbId(omdbDetail.getImdbID());
        movie.setTitle(omdbDetail.getTitle());
        movie.setYear(omdbDetail.getYear());
        movie.setRated(omdbDetail.getRated());
        movie.setReleased(omdbDetail.getReleased());
        movie.setRuntime(omdbDetail.getRuntime());
        movie.setGenre(omdbDetail.getGenre());
        movie.setDirector(omdbDetail.getDirector());
        movie.setWriter(omdbDetail.getWriter());
        movie.setActors(omdbDetail.getActors());
        movie.setPlot(omdbDetail.getPlot());
        movie.setLanguage(omdbDetail.getLanguage());
        movie.setCountry(omdbDetail.getCountry());
        movie.setAwards(omdbDetail.getAwards());
        movie.setProduction(omdbDetail.getProduction());
        movie.setPoster(omdbDetail.getPoster());
        movie.setMetascore(omdbDetail.getMetascore());
        movie.setImdbRating(omdbDetail.getImdbRating());
        movie.setImdbVotes(omdbDetail.getImdbVotes());
        movie.setType(omdbDetail.getType());
    }
}

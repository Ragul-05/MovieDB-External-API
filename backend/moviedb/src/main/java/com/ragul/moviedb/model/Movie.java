package com.ragul.moviedb.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "movies",
        indexes = {
                @Index(name = "idx_movies_imdb_id", columnList = "imdb_id"),
                @Index(name = "idx_movies_category", columnList = "category")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, name = "imdb_id")
    private String imdbId;

    private String title;
    private String year;
    private String rated;
    private String released;
    private String runtime;
    private String poster;
    private String type;
    private String genre;
    private String director;
    private String writer;
    private String actors;
    private String language;
    private String country;
    private String awards;
    private String metascore;
    private String imdbRating;
    private String imdbVotes;
    private String production;
    private String youtubeUrl;
    private String category;

    @Column(columnDefinition = "TEXT")
    private String plot;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

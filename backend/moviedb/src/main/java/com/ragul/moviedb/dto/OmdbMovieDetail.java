package com.ragul.moviedb.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class OmdbMovieDetail {
    @JsonProperty("Title")
    private String title;
    
    @JsonProperty("Year")
    private String year;
    
    @JsonProperty("Rated")
    private String rated;
    
    @JsonProperty("Released")
    private String released;
    
    @JsonProperty("Runtime")
    private String runtime;
    
    @JsonProperty("Genre")
    private String genre;
    
    @JsonProperty("Director")
    private String director;
    
    @JsonProperty("Writer")
    private String writer;
    
    @JsonProperty("Actors")
    private String actors;
    
    @JsonProperty("Plot")
    private String plot;
    
    @JsonProperty("Language")
    private String language;
    
    @JsonProperty("Country")
    private String country;
    
    @JsonProperty("Awards")
    private String awards;

    @JsonProperty("Production")
    private String production;
    
    @JsonProperty("Poster")
    private String poster;
    
    @JsonProperty("Metascore")
    private String metascore;
    
    private String imdbRating;
    private String imdbVotes;
    private String imdbID;
    
    @JsonProperty("Type")
    private String type;
    
    @JsonProperty("Response")
    private String response;
}

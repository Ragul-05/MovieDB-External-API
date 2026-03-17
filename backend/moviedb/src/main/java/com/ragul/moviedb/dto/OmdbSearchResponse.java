package com.ragul.moviedb.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class OmdbSearchResponse {
    @JsonProperty("Search")
    private List<OmdbMovieSummary> search;
    
    @JsonProperty("totalResults")
    private String totalResults;
    
    @JsonProperty("Response")
    private String response;

    @Data
    public static class OmdbMovieSummary {
        @JsonProperty("Title")
        private String title;
        
        @JsonProperty("Year")
        private String year;
        
        private String imdbID;
        
        @JsonProperty("Type")
        private String type;
        
        @JsonProperty("Poster")
        private String poster;
    }
}

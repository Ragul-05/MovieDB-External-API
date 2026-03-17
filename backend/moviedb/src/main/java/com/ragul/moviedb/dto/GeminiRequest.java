package com.ragul.moviedb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GeminiRequest {
    private List<Content> contents;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Content {
        private List<Part> parts;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Part {
        private String text;
    }
}

package com.ragul.moviedb.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Service
@Slf4j
public class YouTubeService {

    private static final String YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${youtube.api.key:}")
    private String youtubeApiKey;

    public Optional<String> getOfficialTrailerUrl(String movieTitle) {
        if (movieTitle == null || movieTitle.isBlank()) {
            return Optional.empty();
        }

        if (youtubeApiKey == null || youtubeApiKey.isBlank() || "YOUR_YOUTUBE_API_KEY_HERE".equals(youtubeApiKey)) {
            log.warn("YouTube API key not configured.");
            return Optional.empty();
        }

        String query = UriUtils.encodeQueryParam(movieTitle + " official trailer", StandardCharsets.UTF_8);
        String url = String.format(
                "%s?part=snippet&type=video&maxResults=1&q=%s&key=%s",
                YOUTUBE_SEARCH_URL,
                query,
                youtubeApiKey
        );

        try {
            JsonNode response = restTemplate.getForObject(url, JsonNode.class);
            JsonNode items = response != null ? response.path("items") : null;
            if (items == null || !items.isArray() || items.isEmpty()) {
                return Optional.empty();
            }

            String videoId = items.get(0).path("id").path("videoId").asText(null);
            if (videoId == null || videoId.isBlank()) {
                return Optional.empty();
            }

            return Optional.of("https://www.youtube.com/watch?v=" + videoId);
        } catch (Exception ex) {
            log.warn("Failed to fetch YouTube trailer for '{}': {}", movieTitle, ex.getMessage());
            return Optional.empty();
        }
    }
}

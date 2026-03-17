package com.ragul.moviedb.service;

import com.ragul.moviedb.dto.GeminiRequest;
import com.ragul.moviedb.dto.GeminiResponse;
import com.ragul.moviedb.model.AiInsight;
import com.ragul.moviedb.model.Favorite;
import com.ragul.moviedb.model.Movie;
import com.ragul.moviedb.model.SearchHistory;
import com.ragul.moviedb.model.User;
import com.ragul.moviedb.repository.AiInsightRepository;
import com.ragul.moviedb.repository.FavoriteRepository;
import com.ragul.moviedb.repository.MovieRepository;
import com.ragul.moviedb.repository.SearchHistoryRepository;
import com.ragul.moviedb.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final AiInsightRepository aiInsightRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;
    private final FavoriteRepository favoriteRepository;
    private final SearchHistoryRepository searchHistoryRepository;
    private final MovieService movieService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${gemini.api.key}")
    private String geminiKey;

    @Value("${gemini.model}")
    private String geminiModel;

    @Value("${gemini.fallback-models:gemini-1.5-flash,gemini-1.5-pro}")
    private String geminiFallbackModels;

    private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";

    public AiInsight getAiSummary(String imdbId) {
        Optional<AiInsight> cachedInsight = Optional.empty();
        try {
            cachedInsight = aiInsightRepository.findByMovieImdbId(imdbId);
            if (cachedInsight.isPresent() && isUsableAiText(cachedInsight.get().getSummary())) {
                return cachedInsight.get();
            }
        } catch (Exception ex) {
            log.warn("Failed to read cached AI insight for {}: {}", imdbId, ex.getMessage());
        }

        Movie movie = movieService.getMovieDetails(imdbId);
        if (movie == null || movie.getPlot() == null) {
            return null;
        }

        String prompt = "Summarize this movie plot in a few sentences and provide 5 relevant tags: " + movie.getPlot();
        String aiResponse = callGemini(prompt);
        String finalSummary = isUsableAiText(aiResponse) ? aiResponse : buildFallbackSummary(movie);
        String finalTags = buildFallbackTags(movie);

        AiInsight insight = cachedInsight
                .map(existing -> {
                    existing.setMovie(movie);
                    existing.setSummary(finalSummary);
                    existing.setTags(finalTags);
                    return existing;
                })
                .orElseGet(() -> AiInsight.builder()
                        .movie(movie)
                        .summary(finalSummary)
                        .tags(finalTags)
                        .build());

        try {
            return aiInsightRepository.save(insight);
        } catch (Exception ex) {
            log.warn("Failed to cache AI insight for {}: {}", imdbId, ex.getMessage());
            return insight;
        }
    }

    public String chat(String userPrompt) {
        String systemPrompt = "You are a movie recommendation assistant. Be helpful and suggest movies based on user queries.";
        String aiResponse = callGemini(systemPrompt + "\nUser: " + userPrompt);
        if (isUsableAiText(aiResponse)) {
            return aiResponse;
        }
        return buildFallbackChatResponse(userPrompt);
    }

    public String getRecommendations(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        String prompt = "Suggest 5 movies for a user who likes watching diverse genres. Provide only a comma-separated list of titles.";
        String aiResponse = callGemini(prompt);
        if (isUsableAiText(aiResponse)) {
            return sanitizeRecommendationText(aiResponse);
        }
        return String.join(", ", buildFallbackRecommendations(user));
    }

    private String callGemini(String prompt) {
        if (geminiKey == null || geminiKey.equals("YOUR_GEMINI_API_KEY_HERE")) {
            log.warn("Gemini API key not configured.");
            return null;
        }

        for (String model : getCandidateModels()) {
            String url = String.format("%s%s:generateContent?key=%s", GEMINI_BASE_URL, model, geminiKey);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            GeminiRequest.Part part = new GeminiRequest.Part(prompt);
            GeminiRequest.Content content = new GeminiRequest.Content(Collections.singletonList(part));
            GeminiRequest request = new GeminiRequest(Collections.singletonList(content));

            HttpEntity<GeminiRequest> entity = new HttpEntity<>(request, headers);
            try {
                GeminiResponse response = restTemplate.postForObject(url, entity, GeminiResponse.class);
                if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()) {
                    String text = response.getCandidates().get(0).getContent().getParts().get(0).getText();
                    if (isUsableAiText(text)) {
                        log.info("Gemini response generated successfully with model {}", model);
                        return text;
                    }
                }
            } catch (Exception e) {
                log.warn("Gemini model {} failed: {}", model, e.getMessage());
            }
        }

        return null;
    }

    private List<String> getCandidateModels() {
        List<String> models = new ArrayList<>();
        if (geminiModel != null && !geminiModel.isBlank()) {
            models.add(geminiModel.trim());
        }
        if (geminiFallbackModels != null && !geminiFallbackModels.isBlank()) {
            Arrays.stream(geminiFallbackModels.split(","))
                    .map(String::trim)
                    .filter(model -> !model.isBlank())
                    .forEach(models::add);
        }
        return models.stream().distinct().collect(Collectors.toList());
    }

    private boolean isUsableAiText(String text) {
        if (text == null || text.isBlank()) {
            return false;
        }

        String normalized = text.toLowerCase();
        return !normalized.contains("quota exceeded")
                && !normalized.contains("error calling ai service")
                && !normalized.contains("too many requests")
                && !normalized.contains("resource_exhausted")
                && !normalized.contains("api key not configured")
                && !normalized.contains("no response from ai service");
    }

    private String buildFallbackChatResponse(String userPrompt) {
        if (userPrompt == null || userPrompt.isBlank()) {
            return "I can't reach the AI service right now. Try asking for action, drama, sci-fi, or a favorite actor, and I'll suggest something helpful.";
        }

        String normalized = userPrompt.toLowerCase();
        String actor = detectActor(normalized);
        List<String> titles = new ArrayList<>();

        if (actor != null) {
            titles.addAll(getActorTitles(actor, normalized));
        }

        if (titles.isEmpty()) {
            titles.addAll(getGenreTitles(normalized));
        }

        if (titles.isEmpty()) {
            titles.addAll(List.of("Inception", "Interstellar", "The Dark Knight", "Leo", "Master"));
        }

        String intro = actor != null
                ? String.format("Gemini is unavailable right now, but here are some %s picks I can suggest", actor)
                : "Gemini is unavailable right now, but here are some movies you can try";

        List<String> rankedTitles = titles.stream().distinct().limit(5).toList();
        String numberedList = formatNumberedList(rankedTitles);
        return intro + ":\n" + numberedList;
    }

    private String detectActor(String prompt) {
        if (prompt.contains("vijay")) return "Vijay";
        if (prompt.contains("rajinikanth")) return "Rajinikanth";
        if (prompt.contains("kamal")) return "Kamal Haasan";
        if (prompt.contains("ajith")) return "Ajith Kumar";
        if (prompt.contains("suriya")) return "Suriya";
        if (prompt.contains("dhanush")) return "Dhanush";
        if (prompt.contains("leo dicaprio") || prompt.contains("leonardo dicaprio")) return "Leonardo DiCaprio";
        if (prompt.contains("tom cruise")) return "Tom Cruise";
        return null;
    }

    private List<String> getActorTitles(String actor, String prompt) {
        boolean actionOnly = prompt.contains("action");

        return switch (actor) {
            case "Vijay" -> actionOnly
                    ? List.of("Leo", "Master", "Thuppakki", "Kaththi", "Mersal")
                    : List.of("Leo", "Master", "Thuppakki", "Kaththi", "Ghilli");
            case "Rajinikanth" -> List.of("Jailer", "Sivaji", "Enthiran", "Petta", "Kaala");
            case "Kamal Haasan" -> List.of("Vikram", "Indian", "Nayakan", "Dasavathaaram", "Viswaroopam");
            case "Ajith Kumar" -> List.of("Mankatha", "Billa", "Yennai Arindhaal", "Vedalam", "Valimai");
            case "Suriya" -> List.of("Soorarai Pottru", "Singam", "24", "Ayan", "Jai Bhim");
            case "Dhanush" -> List.of("Asuran", "Vada Chennai", "Karnan", "Maari", "Velaiilla Pattadhari");
            case "Leonardo DiCaprio" -> List.of("Inception", "The Revenant", "Shutter Island", "The Departed", "Titanic");
            case "Tom Cruise" -> List.of("Mission: Impossible - Fallout", "Top Gun: Maverick", "Edge of Tomorrow", "Minority Report", "Jack Reacher");
            default -> Collections.emptyList();
        };
    }

    private List<String> getGenreTitles(String prompt) {
        if (prompt.contains("action")) return List.of("Mad Max: Fury Road", "The Dark Knight", "John Wick", "Leo", "Master");
        if (prompt.contains("sci-fi") || prompt.contains("science fiction")) return List.of("Interstellar", "Inception", "The Matrix", "Arrival", "Blade Runner 2049");
        if (prompt.contains("crime")) return List.of("Heat", "The Departed", "Vada Chennai", "Mankatha", "Se7en");
        if (prompt.contains("drama")) return List.of("The Shawshank Redemption", "Forrest Gump", "Jai Bhim", "Asuran", "Whiplash");
        if (prompt.contains("thriller")) return List.of("Shutter Island", "Prisoners", "Gone Girl", "Zodiac", "Memories of Murder");
        return Collections.emptyList();
    }

    private String formatNumberedList(List<String> items) {
        StringBuilder builder = new StringBuilder();
        for (int index = 0; index < items.size(); index++) {
            if (index > 0) {
                builder.append("\n");
            }
            builder.append(index + 1).append(". ").append(items.get(index));
        }
        return builder.toString();
    }

    private String buildFallbackSummary(Movie movie) {
        String plot = movie.getPlot();
        if (plot == null || plot.isBlank() || "N/A".equalsIgnoreCase(plot)) {
            return "A detailed AI summary is unavailable right now, but this title is worth exploring for its strong story and memorable characters.";
        }

        String cleanedPlot = plot.trim();
        if (cleanedPlot.length() <= 260) {
            return cleanedPlot;
        }

        return cleanedPlot.substring(0, 257).trim() + "...";
    }

    private String buildFallbackTags(Movie movie) {
        if (movie.getGenre() == null || movie.getGenre().isBlank()) {
            return "story-driven, must-watch";
        }

        return Arrays.stream(movie.getGenre().split(","))
                .map(String::trim)
                .filter(tag -> !tag.isBlank())
                .limit(5)
                .collect(Collectors.joining(", "));
    }

    private String sanitizeRecommendationText(String text) {
        return Arrays.stream(text.split(","))
                .map(String::trim)
                .map(title -> title.replaceAll("^[0-9]+[.)-]?\\s*", ""))
                .map(title -> title.replaceAll("^[-*•]+\\s*", ""))
                .filter(title -> !title.isBlank())
                .filter(title -> title.length() <= 80)
                .limit(10)
                .collect(Collectors.joining(", "));
    }

    private List<String> buildFallbackRecommendations(User user) {
        Set<String> recommendations = new LinkedHashSet<>();

        List<Favorite> favorites = favoriteRepository.findByUser(user);
        List<SearchHistory> history = searchHistoryRepository.findByUserOrderByCreatedAtDesc(user);

        for (Favorite favorite : favorites) {
            String genre = favorite.getMovie() != null ? favorite.getMovie().getGenre() : null;
            recommendations.addAll(mapGenreToTitles(genre));
            if (recommendations.size() >= 10) {
                return new ArrayList<>(recommendations).subList(0, 10);
            }
        }

        for (SearchHistory item : history) {
            recommendations.addAll(mapQueryToTitles(item.getSearchQuery()));
            if (recommendations.size() >= 10) {
                return new ArrayList<>(recommendations).subList(0, 10);
            }
        }

        recommendations.addAll(List.of(
                "The Shawshank Redemption",
                "The Dark Knight",
                "Interstellar",
                "Inception",
                "The Matrix",
                "The Godfather",
                "Pulp Fiction",
                "Gladiator",
                "Parasite",
                "The Lord of the Rings"
        ));

        return new ArrayList<>(recommendations).subList(0, Math.min(10, recommendations.size()));
    }

    private List<String> mapGenreToTitles(String genreText) {
        if (genreText == null || genreText.isBlank()) {
            return Collections.emptyList();
        }

        String normalized = genreText.toLowerCase();
        List<String> titles = new ArrayList<>();

        if (normalized.contains("action")) {
            titles.addAll(List.of("Mad Max: Fury Road", "The Dark Knight", "Gladiator"));
        }
        if (normalized.contains("adventure")) {
            titles.addAll(List.of("Interstellar", "The Lord of the Rings", "Avatar"));
        }
        if (normalized.contains("sci-fi")) {
            titles.addAll(List.of("Blade Runner 2049", "Arrival", "The Matrix"));
        }
        if (normalized.contains("crime")) {
            titles.addAll(List.of("The Departed", "Heat", "Se7en"));
        }
        if (normalized.contains("drama")) {
            titles.addAll(List.of("The Shawshank Redemption", "Forrest Gump", "Whiplash"));
        }
        if (normalized.contains("thriller")) {
            titles.addAll(List.of("Prisoners", "Gone Girl", "Shutter Island"));
        }

        return titles;
    }

    private List<String> mapQueryToTitles(String query) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        String normalized = query.toLowerCase();
        if (normalized.contains("batman")) return List.of("The Dark Knight", "Batman Begins", "The Batman");
        if (normalized.contains("avengers")) return List.of("Avengers: Endgame", "Captain America: Civil War", "Guardians of the Galaxy");
        if (normalized.contains("space")) return List.of("Interstellar", "Gravity", "The Martian");
        if (normalized.contains("crime")) return List.of("Heat", "The Departed", "Zodiac");
        if (normalized.contains("mind")) return List.of("Inception", "Memento", "Shutter Island");

        return Collections.emptyList();
    }
}

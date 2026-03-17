package com.ragul.moviedb.controller;

import com.ragul.moviedb.model.AiInsight;
import com.ragul.moviedb.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/summary")
    public ResponseEntity<AiInsight> getSummary(@RequestParam String imdbId) {
        AiInsight insight = aiService.getAiSummary(imdbId);
        if (insight == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(insight);
    }

    @GetMapping("/recommendations")
    public ResponseEntity<Map<String, String>> getRecommendations(@AuthenticationPrincipal UserDetails userDetails) {
        String recommendations = aiService.getRecommendations(userDetails.getUsername());
        return ResponseEntity.ok(Map.of("recommendations", recommendations));
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> payload) {
        String prompt = payload.get("prompt");
        String response = aiService.chat(prompt);
        return ResponseEntity.ok(Map.of("response", response));
    }
}

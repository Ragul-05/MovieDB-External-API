package com.ragul.moviedb.controller;

import com.ragul.moviedb.model.SearchHistory;
import com.ragul.moviedb.service.HistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryService historyService;

    @GetMapping
    public ResponseEntity<List<SearchHistory>> getHistory(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(historyService.getHistory(userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistoryItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        historyService.deleteHistoryItem(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearHistory(@AuthenticationPrincipal UserDetails userDetails) {
        historyService.clearHistory(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}

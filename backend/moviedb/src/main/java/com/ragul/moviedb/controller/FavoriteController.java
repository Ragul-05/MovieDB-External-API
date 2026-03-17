package com.ragul.moviedb.controller;

import com.ragul.moviedb.model.Favorite;
import com.ragul.moviedb.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping
    public ResponseEntity<Favorite> addFavorite(@RequestParam String imdbId, @AuthenticationPrincipal UserDetails userDetails) {
        Favorite favorite = favoriteService.addFavorite(imdbId, userDetails.getUsername());
        if (favorite == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(favorite);
    }

    @GetMapping
    public ResponseEntity<List<Favorite>> getFavorites(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(favoriteService.getFavorites(userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        favoriteService.removeFavorite(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}

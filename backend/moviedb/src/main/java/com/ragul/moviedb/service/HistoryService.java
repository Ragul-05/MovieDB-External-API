package com.ragul.moviedb.service;

import com.ragul.moviedb.model.SearchHistory;
import com.ragul.moviedb.model.User;
import com.ragul.moviedb.repository.SearchHistoryRepository;
import com.ragul.moviedb.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HistoryService {

    private final SearchHistoryRepository historyRepository;
    private final UserRepository userRepository;

    public List<SearchHistory> getHistory(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        return historyRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional
    public void deleteHistoryItem(Long historyId, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        SearchHistory historyItem = historyRepository.findByIdAndUser(historyId, user).orElseThrow();
        historyRepository.delete(historyItem);
    }

    @Transactional
    public void clearHistory(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        List<SearchHistory> historyItems = historyRepository.findByUserOrderByCreatedAtDesc(user);
        historyRepository.deleteAll(historyItems);
    }
}

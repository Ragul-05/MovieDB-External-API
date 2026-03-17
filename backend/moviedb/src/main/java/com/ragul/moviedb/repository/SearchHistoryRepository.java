package com.ragul.moviedb.repository;

import com.ragul.moviedb.model.SearchHistory;
import com.ragul.moviedb.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {
    List<SearchHistory> findByUserOrderByCreatedAtDesc(User user);
    Optional<SearchHistory> findByIdAndUser(Long id, User user);
}

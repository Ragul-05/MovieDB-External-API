package com.ragul.moviedb.repository;

import com.ragul.moviedb.model.User;
import com.ragul.moviedb.model.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserPreferenceRepository extends JpaRepository<UserPreference, Long> {
    Optional<UserPreference> findByUser(User user);
    Optional<UserPreference> findByUserEmail(String email);
}

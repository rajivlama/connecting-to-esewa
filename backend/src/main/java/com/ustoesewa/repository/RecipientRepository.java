package com.ustoesewa.repository;

import com.ustoesewa.model.entity.Recipient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecipientRepository extends JpaRepository<Recipient, Long> {
    List<Recipient> findByUserIdOrderByCreatedAtDesc(Long userId);
}

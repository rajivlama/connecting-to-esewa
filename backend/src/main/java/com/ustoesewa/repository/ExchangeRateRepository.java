package com.ustoesewa.repository;

import com.ustoesewa.model.entity.ExchangeRate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, Long> {
    Optional<ExchangeRate> findBySourceCurrencyAndDestinationCurrency(String source, String destination);
}

package com.ustoesewa.service;

import com.ustoesewa.integration.ThunesClient;
import com.ustoesewa.model.entity.ExchangeRate;
import com.ustoesewa.repository.ExchangeRateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExchangeRateService {

    private final ExchangeRateRepository exchangeRateRepository;
    private final ThunesClient thunesClient;

    private static final BigDecimal DEFAULT_USD_TO_NPR = new BigDecimal("133.50");

    @Transactional(readOnly = true)
    public BigDecimal getUsdToNprRate() {
        return exchangeRateRepository.findBySourceCurrencyAndDestinationCurrency("USD", "NPR")
                .map(ExchangeRate::getRate)
                .orElseGet(this::getOrCreateDefaultRate);
    }

    @Transactional
    public BigDecimal getOrCreateDefaultRate() {
        Optional<ExchangeRate> existing = exchangeRateRepository.findBySourceCurrencyAndDestinationCurrency("USD", "NPR");
        if (existing.isPresent()) {
            return existing.get().getRate();
        }

        BigDecimal rate = fetchRateFromThunesOrUseDefault();
        ExchangeRate er = ExchangeRate.builder()
                .sourceCurrency("USD")
                .destinationCurrency("NPR")
                .rate(rate)
                .updatedAt(Instant.now())
                .build();
        exchangeRateRepository.save(er);
        return rate;
    }

    private BigDecimal fetchRateFromThunesOrUseDefault() {
        try {
            return thunesClient.getQuote(BigDecimal.ONE).orElse(DEFAULT_USD_TO_NPR);
        } catch (Exception e) {
            log.warn("Failed to fetch rate from Thunes, using default: {}", e.getMessage());
            return DEFAULT_USD_TO_NPR;
        }
    }

    @Transactional
    public void updateRate(BigDecimal rate) {
        exchangeRateRepository.findBySourceCurrencyAndDestinationCurrency("USD", "NPR")
                .ifPresentOrElse(
                        er -> {
                            er.setRate(rate);
                            er.setUpdatedAt(Instant.now());
                            exchangeRateRepository.save(er);
                        },
                        () -> {
                            ExchangeRate er = ExchangeRate.builder()
                                    .sourceCurrency("USD")
                                    .destinationCurrency("NPR")
                                    .rate(rate)
                                    .updatedAt(Instant.now())
                                    .build();
                            exchangeRateRepository.save(er);
                        }
                );
    }
}

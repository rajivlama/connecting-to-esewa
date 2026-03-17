package com.ustoesewa.service;

import com.ustoesewa.config.AppConfig;
import com.ustoesewa.dto.QuoteResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class QuoteService {

    private final ExchangeRateService exchangeRateService;
    private final AppConfig.FeeProperties feeProperties;

    public QuoteResponse getQuote(BigDecimal sourceAmount) {
        BigDecimal rate = exchangeRateService.getUsdToNprRate();
        BigDecimal fee = calculateFee(sourceAmount);
        BigDecimal destinationAmount = sourceAmount.multiply(rate).setScale(2, RoundingMode.DOWN);

        return QuoteResponse.builder()
                .sourceAmount(sourceAmount)
                .destinationAmount(destinationAmount)
                .fee(fee)
                .exchangeRate(rate)
                .totalAmount(sourceAmount.add(fee))
                .sourceCurrency("USD")
                .destinationCurrency("NPR")
                .build();
    }

    private BigDecimal calculateFee(BigDecimal amount) {
        BigDecimal flatFee = BigDecimal.valueOf(feeProperties.flatUsd());
        BigDecimal percentFee = amount.multiply(BigDecimal.valueOf(feeProperties.percent() / 100));
        return flatFee.add(percentFee).setScale(2, RoundingMode.HALF_UP);
    }
}

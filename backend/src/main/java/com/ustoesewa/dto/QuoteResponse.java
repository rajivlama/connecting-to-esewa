package com.ustoesewa.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class QuoteResponse {
    private BigDecimal sourceAmount;
    private BigDecimal destinationAmount;
    private BigDecimal fee;
    private BigDecimal exchangeRate;
    private BigDecimal totalAmount;
    private String sourceCurrency;
    private String destinationCurrency;
}

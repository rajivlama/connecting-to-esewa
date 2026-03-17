package com.ustoesewa.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreatePaymentIntentRequest {
    @NotNull
    private Long recipientId;

    @NotNull
    @DecimalMin("1.00")
    private BigDecimal sourceAmount;
}

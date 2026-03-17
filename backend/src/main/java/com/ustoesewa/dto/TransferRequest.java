package com.ustoesewa.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransferRequest {
    @NotNull
    private Long recipientId;

    @NotNull
    @DecimalMin(value = "1.00", message = "Minimum amount is $1.00")
    private BigDecimal sourceAmount;

    private String paymentMethodId;
}

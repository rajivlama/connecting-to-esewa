package com.ustoesewa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ConfirmTransferRequest {
    @NotBlank
    private String paymentIntentId;

    @NotNull
    private Long recipientId;

    @NotNull
    private BigDecimal sourceAmount;
}

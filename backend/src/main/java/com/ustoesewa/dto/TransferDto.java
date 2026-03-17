package com.ustoesewa.dto;

import com.ustoesewa.model.entity.Transfer;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class TransferDto {
    private Long id;
    private RecipientDto recipient;
    private BigDecimal sourceAmount;
    private BigDecimal destinationAmount;
    private BigDecimal fee;
    private BigDecimal exchangeRate;
    private BigDecimal totalAmount;
    private Transfer.TransferStatus status;
    private String thunesTransactionId;
    private Instant createdAt;
    private Instant completedAt;

    public static TransferDto from(Transfer t) {
        return TransferDto.builder()
                .id(t.getId())
                .recipient(RecipientDto.from(t.getRecipient()))
                .sourceAmount(t.getSourceAmount())
                .destinationAmount(t.getDestinationAmount())
                .fee(t.getFee())
                .exchangeRate(t.getExchangeRate())
                .totalAmount(t.getSourceAmount().add(t.getFee()))
                .status(t.getStatus())
                .thunesTransactionId(t.getThunesTransactionId())
                .createdAt(t.getCreatedAt())
                .completedAt(t.getCompletedAt())
                .build();
    }
}

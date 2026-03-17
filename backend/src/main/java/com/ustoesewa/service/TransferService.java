package com.ustoesewa.service;

import com.ustoesewa.dto.ConfirmTransferRequest;
import com.ustoesewa.dto.QuoteResponse;
import com.ustoesewa.dto.TransferDto;
import com.ustoesewa.integration.StripeService;
import com.ustoesewa.integration.ThunesClient;
import com.ustoesewa.model.entity.Recipient;
import com.ustoesewa.model.entity.Transfer;
import com.ustoesewa.model.entity.User;
import com.ustoesewa.repository.RecipientRepository;
import com.ustoesewa.repository.TransferRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransferService {

    private final TransferRepository transferRepository;
    private final RecipientRepository recipientRepository;
    private final QuoteService quoteService;
    private final StripeService stripeService;
    private final ThunesClient thunesClient;

    public QuoteResponse getQuote(BigDecimal sourceAmount) {
        return quoteService.getQuote(sourceAmount);
    }

    public String createPaymentIntent(Long userId, Long recipientId, BigDecimal sourceAmount) {
        Recipient recipient = recipientRepository.findById(recipientId)
                .orElseThrow(() -> new IllegalArgumentException("Recipient not found"));
        if (!recipient.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Recipient not found");
        }

        QuoteResponse quote = quoteService.getQuote(sourceAmount);
        BigDecimal totalAmount = quote.getTotalAmount();

        try {
            return stripeService.createPaymentIntent(totalAmount, "Transfer to " + recipient.getFullName());
        } catch (Exception e) {
            log.error("Failed to create payment intent: {}", e.getMessage());
            throw new RuntimeException("Payment initialization failed");
        }
    }

    @Transactional
    public TransferDto confirmTransfer(User user, ConfirmTransferRequest request) {
        Recipient recipient = recipientRepository.findById(request.getRecipientId())
                .orElseThrow(() -> new IllegalArgumentException("Recipient not found"));
        if (!recipient.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Recipient not found");
        }

        if (!stripeService.confirmPayment(request.getPaymentIntentId())) {
            throw new IllegalArgumentException("Payment not confirmed");
        }

        QuoteResponse quote = quoteService.getQuote(request.getSourceAmount());
        BigDecimal totalAmount = quote.getSourceAmount().add(quote.getFee());

        Transfer transfer = Transfer.builder()
                .user(user)
                .recipient(recipient)
                .sourceAmount(request.getSourceAmount())
                .destinationAmount(quote.getDestinationAmount())
                .fee(quote.getFee())
                .exchangeRate(quote.getExchangeRate())
                .status(Transfer.TransferStatus.PROCESSING)
                .stripePaymentId(request.getPaymentIntentId())
                .build();

        transfer = transferRepository.save(transfer);

        String reference = "USTOESEWA-" + transfer.getId() + "-" + UUID.randomUUID().toString().substring(0, 8);
        Optional<String> thunesId = thunesClient.createTransfer(
                recipient.getESewaId(),
                quote.getDestinationAmount(),
                reference
        );

        if (thunesId.isPresent()) {
            transfer.setThunesTransactionId(thunesId.get());
            transfer.setStatus(Transfer.TransferStatus.COMPLETED);
            transfer.setCompletedAt(Instant.now());
        } else {
            transfer.setStatus(Transfer.TransferStatus.FAILED);
        }

        transfer = transferRepository.save(transfer);
        return TransferDto.from(transfer);
    }

    @Transactional(readOnly = true)
    public List<TransferDto> findByUserId(Long userId) {
        return transferRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(TransferDto::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TransferDto findByIdAndUserId(Long id, Long userId) {
        Transfer t = transferRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Transfer not found"));
        return TransferDto.from(t);
    }
}

package com.ustoesewa.controller;

import com.ustoesewa.dto.*;
import com.ustoesewa.model.entity.User;
import com.ustoesewa.service.TransferService;
import com.ustoesewa.service.UserResolverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;
    private final UserResolverService userResolverService;

    @GetMapping("/quote")
    public ResponseEntity<QuoteResponse> getQuote(@RequestParam BigDecimal amount) {
        return ResponseEntity.ok(transferService.getQuote(amount));
    }

    @PostMapping("/payment-intent")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@Valid @RequestBody CreatePaymentIntentRequest request,
                                                                   @AuthenticationPrincipal UserDetails user) {
        Long userId = userResolverService.resolveUserId(user);
        String clientSecret = transferService.createPaymentIntent(userId, request.getRecipientId(), request.getSourceAmount());
        return ResponseEntity.ok(Map.of("clientSecret", clientSecret));
    }

    @PostMapping("/confirm")
    public ResponseEntity<TransferDto> confirm(@Valid @RequestBody ConfirmTransferRequest request,
                                               @AuthenticationPrincipal UserDetails user) {
        User u = userResolverService.resolveUser(user);
        return ResponseEntity.ok(transferService.confirmTransfer(u, request));
    }

    @GetMapping
    public ResponseEntity<List<TransferDto>> list(@AuthenticationPrincipal UserDetails user) {
        Long userId = userResolverService.resolveUserId(user);
        return ResponseEntity.ok(transferService.findByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransferDto> get(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        Long userId = userResolverService.resolveUserId(user);
        return ResponseEntity.ok(transferService.findByIdAndUserId(id, userId));
    }
}

package com.ustoesewa.controller;

import com.ustoesewa.dto.QuoteResponse;
import com.ustoesewa.service.QuoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class QuoteController {

    private final QuoteService quoteService;

    @GetMapping("/quote")
    public ResponseEntity<QuoteResponse> getQuote(@RequestParam BigDecimal amount) {
        return ResponseEntity.ok(quoteService.getQuote(amount));
    }
}

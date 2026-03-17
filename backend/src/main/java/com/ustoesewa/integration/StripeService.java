package com.ustoesewa.integration;

import com.ustoesewa.config.AppConfig;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.Stripe;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.util.UUID;

@Service
@Slf4j
public class StripeService {

    private final AppConfig.StripeProperties stripeProperties;
    private boolean mockMode = false;

    public StripeService(AppConfig.StripeProperties stripeProperties) {
        this.stripeProperties = stripeProperties;
    }

    @PostConstruct
    public void init() {
        if (stripeProperties.secretKey() != null && !stripeProperties.secretKey().isEmpty()
                && !stripeProperties.secretKey().contains("placeholder")) {
            Stripe.apiKey = stripeProperties.secretKey();
        } else {
            mockMode = true;
            log.info("Stripe not configured - using mock payment mode for demo");
        }
    }

    public String createPaymentIntent(BigDecimal amountUsd, String description) throws StripeException {
        if (mockMode) {
            return "pi_mock_" + UUID.randomUUID() + "_secret_mock_secret";
        }

        long amountCents = amountUsd.multiply(BigDecimal.valueOf(100)).longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountCents)
                .setCurrency("usd")
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                )
                .putMetadata("description", description != null ? description : "US to eSewa transfer")
                .build();

        PaymentIntent intent = PaymentIntent.create(params);
        return intent.getClientSecret();
    }

    public boolean confirmPayment(String paymentIntentId) {
        if (mockMode && paymentIntentId != null && paymentIntentId.startsWith("pi_mock_")) {
            return true;
        }
        try {
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            return "succeeded".equals(intent.getStatus());
        } catch (StripeException e) {
            log.error("Stripe confirm failed: {}", e.getMessage());
            return false;
        }
    }
}

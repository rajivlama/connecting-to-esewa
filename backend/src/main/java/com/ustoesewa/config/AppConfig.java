package com.ustoesewa.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Value("${app.stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${app.stripe.webhook-secret}")
    private String stripeWebhookSecret;

    @Value("${app.thunes.api-url}")
    private String thunesApiUrl;

    @Value("${app.thunes.api-key}")
    private String thunesApiKey;

    @Value("${app.fee.flat-usd:2.99}")
    private double feeFlatUsd;

    @Value("${app.fee.percent:0}")
    private double feePercent;

    @Bean
    public StripeProperties stripeProperties() {
        return new StripeProperties(stripeSecretKey, stripeWebhookSecret);
    }

    @Bean
    public ThunesProperties thunesProperties() {
        return new ThunesProperties(thunesApiUrl, thunesApiKey);
    }

    @Bean
    public FeeProperties feeProperties() {
        return new FeeProperties(feeFlatUsd, feePercent);
    }

    public record StripeProperties(String secretKey, String webhookSecret) {}
    public record ThunesProperties(String apiUrl, String apiKey) {}
    public record FeeProperties(double flatUsd, double percent) {}
}

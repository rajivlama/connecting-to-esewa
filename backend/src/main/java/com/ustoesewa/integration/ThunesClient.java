package com.ustoesewa.integration;

import com.ustoesewa.config.AppConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.Optional;

/**
 * Thunes Money Transfer API v2 client.
 * In sandbox/demo mode without valid API key, returns mock responses.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ThunesClient {

    private final AppConfig.ThunesProperties thunesProperties;
    private final RestTemplate restTemplate;

    private static final BigDecimal MOCK_RATE = new BigDecimal("133.50");

    public Optional<BigDecimal> getQuote(BigDecimal amountUsd) {
        if (!hasValidConfig()) {
            return Optional.of(MOCK_RATE);
        }
        try {
            String url = thunesProperties.apiUrl() + "/v2/money-transfer/quote";
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(thunesProperties.apiKey());
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of(
                    "source", Map.of("amount", amountUsd, "currency", "USD"),
                    "destination", Map.of("currency", "NPR"),
                    "destinationCountry", "NP"
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object rateObj = ((Map) response.getBody()).get("destinationAmount");
                if (rateObj != null) {
                    BigDecimal destAmount = new BigDecimal(rateObj.toString());
                    return Optional.of(destAmount.divide(amountUsd, 6, RoundingMode.HALF_UP));
                }
            }
        } catch (Exception e) {
            log.warn("Thunes quote failed: {}", e.getMessage());
        }
        return Optional.of(MOCK_RATE);
    }

    public Optional<String> createTransfer(String eSewaId, BigDecimal amountNpr, String reference) {
        if (!hasValidConfig()) {
            log.info("Thunes not configured, simulating transfer to eSewa {}", eSewaId);
            return Optional.of("MOCK-TXN-" + System.currentTimeMillis());
        }
        try {
            String url = thunesProperties.apiUrl() + "/v2/money-transfer/transfers";
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(thunesProperties.apiKey());
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of(
                    "externalId", reference,
                    "payee", Map.of(
                            "type", "WALLET",
                            "accountId", eSewaId,
                            "country", "NP"
                    ),
                    "source", Map.of("amount", amountNpr, "currency", "NPR"),
                    "destination", Map.of("amount", amountNpr, "currency", "NPR")
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object idObj = ((Map) response.getBody()).get("id");
                return Optional.ofNullable(idObj != null ? idObj.toString() : null);
            }
        } catch (Exception e) {
            log.error("Thunes transfer failed: {}", e.getMessage());
        }
        return Optional.empty();
    }

    public String getTransferStatus(String thunesTransactionId) {
        if (!hasValidConfig() || thunesTransactionId == null || thunesTransactionId.startsWith("MOCK-")) {
            return "COMPLETED";
        }
        try {
            String url = thunesProperties.apiUrl() + "/v2/money-transfer/transfers/" + thunesTransactionId;
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(thunesProperties.apiKey());

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object status = ((Map) response.getBody()).get("status");
                return status != null ? status.toString() : "PENDING";
            }
        } catch (Exception e) {
            log.warn("Thunes status check failed: {}", e.getMessage());
        }
        return "PENDING";
    }

    private boolean hasValidConfig() {
        return thunesProperties.apiKey() != null
                && !thunesProperties.apiKey().isBlank()
                && !thunesProperties.apiKey().equals("placeholder");
    }
}

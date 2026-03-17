package com.ustoesewa.controller;

import com.ustoesewa.dto.RecipientDto;
import com.ustoesewa.dto.RecipientRequest;
import com.ustoesewa.service.RecipientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipients")
@RequiredArgsConstructor
public class RecipientController {

    private final RecipientService recipientService;
    private final com.ustoesewa.service.UserResolverService userResolverService;

    @GetMapping
    public ResponseEntity<List<RecipientDto>> list(@AuthenticationPrincipal UserDetails user) {
        Long userId = userResolverService.resolveUserId(user);
        return ResponseEntity.ok(recipientService.findByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecipientDto> get(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        Long userId = userResolverService.resolveUserId(user);
        return ResponseEntity.ok(recipientService.findByIdAndUserId(id, userId));
    }

    @PostMapping
    public ResponseEntity<RecipientDto> create(@Valid @RequestBody RecipientRequest request,
                                               @AuthenticationPrincipal UserDetails user) {
        Long userId = userResolverService.resolveUserId(user);
        return ResponseEntity.ok(recipientService.create(userId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecipientDto> update(@PathVariable Long id, @Valid @RequestBody RecipientRequest request,
                                               @AuthenticationPrincipal UserDetails user) {
        Long userId = userResolverService.resolveUserId(user);
        return ResponseEntity.ok(recipientService.update(id, userId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        Long userId = userResolverService.resolveUserId(user);
        recipientService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }
}

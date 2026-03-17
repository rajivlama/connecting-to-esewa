package com.ustoesewa.service;

import com.ustoesewa.dto.RecipientDto;
import com.ustoesewa.dto.RecipientRequest;
import com.ustoesewa.model.entity.Recipient;
import com.ustoesewa.model.entity.User;
import com.ustoesewa.repository.RecipientRepository;
import com.ustoesewa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecipientService {

    private final RecipientRepository recipientRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<RecipientDto> findByUserId(Long userId) {
        return recipientRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(RecipientDto::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RecipientDto findByIdAndUserId(Long id, Long userId) {
        Recipient r = recipientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recipient not found"));
        if (!r.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Recipient not found");
        }
        return RecipientDto.from(r);
    }

    @Transactional
    public RecipientDto create(Long userId, RecipientRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Recipient recipient = Recipient.builder()
                .user(user)
                .fullName(request.getFullName())
                .eSewaId(request.getESewaId())
                .relationship(request.getRelationship())
                .build();
        recipient = recipientRepository.save(recipient);
        return RecipientDto.from(recipient);
    }

    @Transactional
    public RecipientDto update(Long id, Long userId, RecipientRequest request) {
        Recipient r = recipientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recipient not found"));
        if (!r.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Recipient not found");
        }
        r.setFullName(request.getFullName());
        r.setESewaId(request.getESewaId());
        r.setRelationship(request.getRelationship());
        return RecipientDto.from(recipientRepository.save(r));
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Recipient r = recipientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recipient not found"));
        if (!r.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Recipient not found");
        }
        recipientRepository.delete(r);
    }
}

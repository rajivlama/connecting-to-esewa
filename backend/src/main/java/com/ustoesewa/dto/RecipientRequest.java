package com.ustoesewa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RecipientRequest {
    @NotBlank
    private String fullName;

    @NotBlank
    @Pattern(regexp = "^(98|97)\\d{8}$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
            message = "eSewa ID must be 10-digit Nepal mobile (98/97) or email")
    private String eSewaId;

    private String relationship;
}

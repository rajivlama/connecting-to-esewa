package com.ustoesewa.dto;

import com.ustoesewa.model.entity.User;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDto {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String country;
    private User.KycStatus kycStatus;

    public static UserDto from(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .country(user.getCountry())
                .kycStatus(user.getKycStatus())
                .build();
    }
}

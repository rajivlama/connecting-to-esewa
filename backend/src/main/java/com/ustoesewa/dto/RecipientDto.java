package com.ustoesewa.dto;

import com.ustoesewa.model.entity.Recipient;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RecipientDto {
    private Long id;
    private String fullName;
    private String eSewaId;
    private String relationship;

    public static RecipientDto from(Recipient r) {
        return RecipientDto.builder()
                .id(r.getId())
                .fullName(r.getFullName())
                .eSewaId(r.getESewaId())
                .relationship(r.getRelationship())
                .build();
    }
}

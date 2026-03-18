package com.freelance.reviewservice.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Integer orderId;
    private Integer gigId;
    private Integer clientId;
    private Integer freelancerId;
    private Integer rating;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

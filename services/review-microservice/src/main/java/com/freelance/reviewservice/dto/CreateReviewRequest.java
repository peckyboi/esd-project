package com.freelance.reviewservice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateReviewRequest {
    @NotNull
    private Integer orderId;

    @NotNull
    private Integer gigId;

    @NotNull
    private Integer clientId;

    @NotNull
    private Integer freelancerId;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    @Size(max=2000)
    private String message;
}

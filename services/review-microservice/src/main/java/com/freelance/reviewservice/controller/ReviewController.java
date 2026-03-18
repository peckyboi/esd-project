// controller/ReviewController.java
package com.freelance.reviewservice.controller;

import com.freelance.reviewservice.dto.CreateReviewRequest;
import com.freelance.reviewservice.dto.ReviewResponse;
import com.freelance.reviewservice.dto.UpdateReviewRequest;
import com.freelance.reviewservice.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse create(@Valid @RequestBody CreateReviewRequest request) {
        return reviewService.createReview(request);
    }

    @GetMapping("/{orderId}")
    public ReviewResponse getByOrderId(@PathVariable Integer orderId) {
        return reviewService.getReviewByOrderId(orderId);
    }

    @GetMapping
    public List<ReviewResponse> list(
            @RequestParam(required = false) Integer gigId,
            @RequestParam(required = false) Integer freelancerId,
            @RequestParam(required = false) Integer clientId) {
        return reviewService.getReviews(gigId, freelancerId, clientId);
    }

    @PutMapping("/{orderId}")
    public ReviewResponse update(@PathVariable Integer orderId, @Valid @RequestBody UpdateReviewRequest request) {
        return reviewService.updateReview(orderId, request);
    }

    @DeleteMapping("/{orderId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer orderId) {
        reviewService.deleteReview(orderId);
    }
}

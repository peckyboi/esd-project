package com.freelance.reviewservice.service;

import com.freelance.reviewservice.dto.CreateReviewRequest;
import com.freelance.reviewservice.dto.ReviewResponse;
import com.freelance.reviewservice.dto.UpdateReviewRequest;
import com.freelance.reviewservice.exception.BadRequestException;
import com.freelance.reviewservice.exception.ResourceNotFoundException;
import com.freelance.reviewservice.model.Review;
import com.freelance.reviewservice.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor //helps to make constructor automatically
public class ReviewService {
    private final ReviewRepository reviewRepository;

    public ReviewResponse createReview(CreateReviewRequest req){
        if(reviewRepository.existsByOrderIdAndClientIdAndIsDeletedFalse(req.getOrderId(), req.getClientId())){
            throw new BadRequestException("Review already exists for this order and client");
        }

        Review review = new Review();
        review.setOrderId(req.getOrderId());
        review.setGigId(req.getGigId());
        review.setClientId(req.getClientId());
        review.setFreelancerId(req.getFreelancerId());
        review.setRating(req.getRating());
        review.setMessage(req.getMessage());

        return toResponse(reviewRepository.save(review)); //saves review into
    }

    public ReviewResponse getReviewById(Integer id){

        //error is thrown in this case because  if i want to get something by a particular id and it doesnt exist it is an exception
        Review review = reviewRepository.findByIdAndIsDeletedFalse(id).orElseThrow(()->new ResourceNotFoundException("Review not found: " + id));
        return toResponse(review);
    }

    /**
     * Finds reviews based on what is provided, so if gigId is provided it
     * will just retrieve gigId, if freelancer is provided but rest not provided
     * it will just retrieve by freelancerId, if not it will retrieve everything
     * minus the deleted reviews
     */
    public List<ReviewResponse> getReviews(Integer gigId, Integer freelancerId, Integer clientId){
        if (gigId != null) {
            return reviewRepository.findByGigIdAndIsDeletedFalse(gigId).stream().map(this::toResponse).toList();
        }
        if (freelancerId != null) {
            return reviewRepository.findByFreelancerIdAndIsDeletedFalse(freelancerId).stream().map(this::toResponse).toList();
        }
        if (clientId != null) {
            return reviewRepository.findByClientIdAndIsDeletedFalse(clientId).stream().map(this::toResponse).toList();
        }

        //note how no error is thrown, it is still valid if there is nothing that matches the request
        return reviewRepository.findAll().stream()
                .filter(r -> !Boolean.TRUE.equals(r.getIsDeleted()))
                .map(this::toResponse)
                .toList();
    }

    public ReviewResponse updateReview(Integer id, UpdateReviewRequest req) {
        Review review = reviewRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + id));

        if (req.getRating() != null) review.setRating(req.getRating());
        if (req.getMessage() != null) review.setMessage(req.getMessage());

        return toResponse(reviewRepository.save(review));
    }

    public void deleteReview(Integer id) {
        Review review = reviewRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + id));

        review.setIsDeleted(true);
        reviewRepository.save(review);
    }

    private ReviewResponse toResponse(Review r){
        return ReviewResponse.builder()
                .id(r.getId())
                .orderId(r.getOrderId())
                .gigId(r.getGigId())
                .clientId(r.getClientId())
                .freelancerId(r.getFreelancerId())
                .rating(r.getRating())
                .message(r.getMessage())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}

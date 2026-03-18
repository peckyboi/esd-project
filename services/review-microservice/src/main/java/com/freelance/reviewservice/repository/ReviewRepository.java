package com.freelance.reviewservice.repository;

import com.freelance.reviewservice.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
/**
 * Handles reading and writing review rows to db and also handles queries, helps compartmentalize SQL so servies stay clean
 */

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    Optional<Review> findByOrderIdAndIsDeletedFalse(Integer orderId);
    boolean existsByOrderIdAndIsDeletedFalse(Integer orderId);
    List<Review> findByGigIdAndIsDeletedFalse(Integer gigId);
    List<Review> findByFreelancerIdAndIsDeletedFalse(Integer freelancerId);
    List<Review> findByClientIdAndIsDeletedFalse(Integer clientId);
}

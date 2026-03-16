package com.freelance.reviewservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Generated;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(
        name="reviews",
        //uniqueconstraints enforces uniqueness on one column or a column combination
        uniqueConstraints = {
                @UniqueConstraint(name="uk_review_order_client", columnNames={"order_id","client_id"})
        },
        //indexes help make reads faster on columns that you query/filter/sort often
        indexes = {
                @Index(name="idx_review_gig_id", columnList = "gig_id"),
                @Index(name="idx_review_freelancer_id", columnList = "freelancer_id"),
                @Index(name="idx_review_client_id", columnList = "client_id"),
        }
)
public class Review {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private int review_id;
    @Column(name="order_id", nullable = false)
    private int order_id;
    @Column(name="gig_id", nullable = false)
    private int gig_id;
    @Column(name="client_id", nullable = false)
    private int client_id;
    @Column(name="freelancer_id", nullable = false)
    private int freelancer_id;

    @Min(1)
    @Max(5)
    @Column(name="order_id", nullable = false)
    private int rating; //rating from 1-5

    @Column(name="order_id", nullable = false)
    private String message;

    @Column(name="is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Column(name="created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name="updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate(){
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate(){
        this.updatedAt = LocalDateTime.now();
    }
}

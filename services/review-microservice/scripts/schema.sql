CREATE TABLE IF NOT EXISTS reviews (
  id INT NOT NULL AUTO_INCREMENT,
  order_id INT NOT NULL,
  gig_id INT NOT NULL,
  client_id INT NOT NULL,
  freelancer_id INT NOT NULL,
  rating INT NOT NULL,
  message TEXT NULL,
  is_deleted BIT(1) NOT NULL DEFAULT b'0',
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_review_gig_id (gig_id),
  INDEX idx_review_freelancer_id (freelancer_id),
  INDEX idx_review_client_id (client_id),
  CONSTRAINT uk_review_order_client UNIQUE (order_id, client_id),
  CONSTRAINT chk_reviews_rating CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB;

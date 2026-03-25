CREATE TABLE IF NOT EXISTS gigs (
  gig_id        INT           NOT NULL AUTO_INCREMENT,
  freelancer_id INT           NOT NULL,
  title         VARCHAR(255)  NOT NULL,
  description   TEXT          NOT NULL,
  category      VARCHAR(100)  NOT NULL,
  price         FLOAT         NOT NULL,
  delivery_days INT           NOT NULL,
  image_url     VARCHAR(500)  DEFAULT NULL,
  status        ENUM('active', 'paused', 'deleted') NOT NULL DEFAULT 'active',
  created_at    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at    DATETIME(6)   NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (gig_id),
  INDEX idx_gig_freelancer_id (freelancer_id),
  INDEX idx_gig_category      (category)
) ENGINE=InnoDB;
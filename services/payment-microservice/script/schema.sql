CREATE TABLE IF NOT EXISTS payments (
  payment_id               INT            NOT NULL AUTO_INCREMENT,
  order_id                 INT            NOT NULL,
  client_id                INT            NOT NULL,
  freelancer_id            INT            NOT NULL,
  amount                   DECIMAL(10, 2) NOT NULL,
  status                   ENUM('held', 'released', 'refunded', 'failed') NOT NULL DEFAULT 'held',
  stripe_payment_intent_id VARCHAR(255)   NULL,
  created_at               DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at               DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (payment_id),
  INDEX idx_payment_order_id      (order_id),
  INDEX idx_payment_client_id     (client_id),
  INDEX idx_payment_freelancer_id (freelancer_id)
) ENGINE=InnoDB;
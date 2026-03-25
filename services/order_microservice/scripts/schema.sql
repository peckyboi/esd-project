CREATE TABLE IF NOT EXISTS orders (
  id                      INT           NOT NULL AUTO_INCREMENT,
  client_id               INT           NOT NULL,
  freelancer_id           INT           NOT NULL,
  gig_id                  INT           NOT NULL,
  price                   FLOAT         NOT NULL,
  status                  ENUM(
                            'pending_payment',
                            'in_progress',
                            'delivered',
                            'completed',
                            'cancelled',
                            'payment_failed',
                            'disputed',
                            'refunded',
                            'released'
                          ) NOT NULL DEFAULT 'pending_payment',
  payment_transaction_id  VARCHAR(100)  NULL,
  dispute_reason          VARCHAR(500)  NULL,
  settlement_amount       FLOAT         NULL,
  disputed_at             DATETIME      NULL,
  resolved_at             DATETIME      NULL,
  created_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_order_client_id     (client_id),
  INDEX idx_order_freelancer_id (freelancer_id),
  INDEX idx_order_gig_id        (gig_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS processed_events (
  id           INT          NOT NULL AUTO_INCREMENT,
  event_id     VARCHAR(100) NOT NULL,
  event_type   VARCHAR(100) NOT NULL,
  processed_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE INDEX idx_processed_event_id (event_id)
) ENGINE=InnoDB;
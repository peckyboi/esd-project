-- Seed data for review_db.reviews
-- Safe to re-run: uses ON DUPLICATE KEY UPDATE on unique (order_id, client_id)

INSERT INTO reviews (
  order_id,
  gig_id,
  client_id,
  freelancer_id,
  rating,
  message,
  is_deleted,
  created_at,
  updated_at
)
VALUES
  (4,  1, 4, 1, 5, 'Excellent work, delivered ahead of schedule.', 0, NOW(), NOW()),
  (2,  1, 9, 1, 4, 'Good work but communication could be improved.', 0, NOW(), NOW()),
  (5,  2, 2, 5, 4, 'Great React site, minor tweaks needed but overall solid.', 0, NOW(), NOW()),
  (9,  4, 4, 7, 2, 'Work did not meet expectations, had to request a refund.', 0, NOW(), NOW()),
  (10, 5, 5, 3, 3, 'Decent work but communication was slow throughout.', 0, NOW(), NOW()),
  (3,  3, 3, 4, 5, 'Video editing was top quality, very happy.', 0, NOW(), NOW())

ON DUPLICATE KEY UPDATE
  gig_id = VALUES(gig_id),
  freelancer_id = VALUES(freelancer_id),
  rating = VALUES(rating),
  message = VALUES(message),
  is_deleted = VALUES(is_deleted),
  updated_at = NOW();

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
  (1001, 501, 201, 301, 5, 'Great work, fast delivery and clear communication.', 0, NOW(), NOW()),
  (1002, 501, 202, 301, 4, 'Solid quality overall, minor revisions needed.', 0, NOW(), NOW()),
  (1003, 502, 203, 302, 5, 'Excellent design and very responsive.', 0, NOW(), NOW()),
  (1004, 503, 204, 303, 3, 'Work completed, but timeline slipped.', 0, NOW(), NOW()),
  (1005, 504, 205, 304, 4, 'Good value for money and smooth handoff.', 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  gig_id = VALUES(gig_id),
  freelancer_id = VALUES(freelancer_id),
  rating = VALUES(rating),
  message = VALUES(message),
  is_deleted = VALUES(is_deleted),
  updated_at = NOW();

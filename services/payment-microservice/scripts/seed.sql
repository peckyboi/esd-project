-- Seed data for payment_db.payments
-- Safe to re-run: uses ON DUPLICATE KEY UPDATE on primary key (payment_id)
-- Covers all PaymentStatus values: held, released, refunded, failed
-- order_id references orders seeded in order_seed.sql
-- client_id and freelancer_id reference users seeded in users.json
-- Run payment_schema.sql first to ensure the table exists.

INSERT INTO payments (
  payment_id,
  order_id,
  client_id,
  freelancer_id,
  amount,
  status,
  stripe_payment_intent_id,
  created_at,
  updated_at
)
VALUES
  -- held: payment held in escrow, order in_progress (matches order 2)
  (1, 2, 2, 3, 250.00, 'held', 'pi_test_001', '2026-01-13 08:00:00', '2026-01-13 08:00:00'),

  -- held: payment held, order delivered but not yet approved (matches order 3)
  (2, 3, 3, 4, 120.00, 'held', 'pi_test_002', '2026-01-15 14:00:00', '2026-01-15 14:00:00'),

  -- released: payment released to freelancer, order completed (matches order 4)
  (3, 4, 1, 2,  75.00, 'released', 'pi_test_003', '2026-01-18 09:00:00', '2026-01-20 10:00:00'),

  -- released: payment released to freelancer, order completed (matches order 5)
  (4, 5, 2, 3, 250.00, 'released', 'pi_test_004', '2026-01-20 08:00:00', '2026-01-25 09:00:00'),

  -- failed: stripe payment failed (matches order 7)
  (5, 7, 5, 6,  60.00, 'failed', NULL, '2026-01-25 11:00:00', '2026-01-25 11:05:00'),

  -- held: payment held while order is disputed (matches order 8)
  (6, 8, 3, 4, 120.00, 'held', 'pi_test_005', '2026-01-28 09:00:00', '2026-02-01 10:00:00'),

  -- refunded: dispute resolved in client favour (matches order 9)
  (7, 9, 4, 5,  95.00, 'refunded', 'pi_test_006', '2026-01-30 10:00:00', '2026-02-05 14:00:00'),

  -- released: dispute resolved in freelancer favour (matches order 10)
  (8, 10, 5, 6, 60.00, 'released', 'pi_test_007', '2026-02-01 08:00:00', '2026-02-08 12:00:00')

ON DUPLICATE KEY UPDATE
  order_id = VALUES(order_id),
  client_id = VALUES(client_id),
  freelancer_id = VALUES(freelancer_id),
  amount = VALUES(amount),
  status = VALUES(status),
  stripe_payment_intent_id = VALUES(stripe_payment_intent_id),
  updated_at = VALUES(updated_at);
-- Seed data for orders_db.orders
-- Safe to re-run: uses ON DUPLICATE KEY UPDATE on primary key (id)
-- Covers all OrderStatus values: pending_payment, in_progress, delivered, completed, cancelled, payment_failed, disputed, refunded, released
-- order IDs 2-10 match payment_seed.sql; do not change those IDs
-- Run order_schema.sql first to ensure the table exists.

INSERT INTO orders (
  id,
  client_id,
  freelancer_id,
  gig_id,
  price,
  status,
  payment_transaction_id,
  dispute_reason,
  settlement_amount,
  disputed_at,
  resolved_at,
  created_at,
  updated_at
)
VALUES
  (1,  1, 2,  1,  75.00, 'pending_payment', NULL, NULL, NULL, NULL, NULL, '2026-01-10 09:00:00', '2026-01-10 09:00:00'),
  (2,  2, 3,  2, 250.00, 'in_progress', 'pi_test_001',  NULL, NULL, NULL, NULL, '2026-01-13 08:00:00', '2026-01-13 09:00:00'),
  (3,  3, 4,  3, 120.00, 'delivered', 'pi_test_002',  NULL, NULL, NULL, NULL, '2026-01-15 14:00:00', '2026-01-17 10:00:00'),
  (4,  1, 2,  1,  75.00, 'completed', 'pi_test_003',  NULL, NULL, NULL, NULL, '2026-01-18 09:00:00', '2026-01-20 10:00:00'),
  (5,  2, 3,  2, 250.00, 'completed', 'pi_test_004',  NULL, NULL, NULL, NULL, '2026-01-20 08:00:00', '2026-01-25 09:00:00'),
  (6,  4, 5,  9, 140.00, 'cancelled', NULL, NULL, NULL, NULL, NULL, '2026-01-22 11:00:00', '2026-01-22 13:00:00'),
  (7,  5, 6,  5,  60.00, 'payment_failed',  NULL, NULL, NULL, NULL, NULL, '2026-01-25 11:00:00', '2026-01-25 11:05:00'),
  (8,  3, 4,  3, 120.00, 'disputed', 'pi_test_005', 'Deliverable did not match agreed scope.', NULL, '2026-02-01 10:00:00', NULL, '2026-01-28 09:00:00', '2026-02-01 10:00:00'),
  (9,  4, 5,  4,  95.00, 'refunded', 'pi_test_006', 'Work quality below expectations.', NULL, '2026-02-03 09:00:00', '2026-02-05 14:00:00', '2026-01-30 10:00:00', '2026-02-05 14:00:00'),
  (10, 5, 6,  5,  60.00, 'released', 'pi_test_007', 'Delay due to client unresponsiveness.', 60.00, '2026-02-05 08:00:00', '2026-02-08 12:00:00', '2026-02-01 08:00:00', '2026-02-08 12:00:00')

ON DUPLICATE KEY UPDATE
  client_id = VALUES(client_id),
  freelancer_id = VALUES(freelancer_id),
  gig_id = VALUES(gig_id),
  price = VALUES(price),
  status = VALUES(status),
  payment_transaction_id = VALUES(payment_transaction_id),
  dispute_reason = VALUES(dispute_reason),
  settlement_amount = VALUES(settlement_amount),
  disputed_at = VALUES(disputed_at),
  resolved_at = VALUES(resolved_at),
  updated_at = VALUES(updated_at);
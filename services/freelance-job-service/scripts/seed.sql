-- Seed data for freelance_job_db.gigs
-- Safe to re-run: uses ON DUPLICATE KEY UPDATE on primary key (gig_id)
-- Covers all GigStatus values: active, paused, deleted
-- Run schema.sql first to ensure the table exists.

INSERT INTO gigs (
  gig_id,
  freelancer_id,
  title,
  description,
  category,
  price,
  delivery_days,
  image_url,
  status,
  created_at,
  updated_at
)
VALUES
  (1,  1,  'Modern minimalist logo design',
       'Professional logo design tailored for startups, brands, and small businesses. Includes multiple concepts and revisions.',
       'Graphics & Design', 75.00, 3, 'https://picsum.photos/seed/gig1/600/400',  'active',  '2025-11-12 14:35:00.000000', '2026-01-10 09:10:00.000000'),

  (2,  5,  'Responsive React website development',
       'Development of modern responsive websites using React and Tailwind CSS with optimized performance and mobile compatibility.',
       'Programming & Technology', 250.00, 5, 'https://picsum.photos/seed/gig2/600/400', 'active', '2025-12-03 08:42:00.000000', '2026-02-05 11:20:00.000000'),

  (3,  4,  'Professional YouTube video editing',
       'Editing services for YouTube content including transitions, subtitles, sound balancing, and visual effects.',
       'Video & Animation',  120.00, 2, 'https://picsum.photos/seed/gig3/600/400',  'active',  '2025-10-18 19:05:00.000000', '2026-02-11 07:45:00.000000'),

  (4,  7,  'Music mixing and mastering',
       'Studio-quality mixing and mastering services for songs, podcasts, or audio productions.',
       'Music & Audio', 95.00, 4,  'https://picsum.photos/seed/gig4/600/400',  'active',  '2025-09-25 16:30:00.000000', '2026-01-18 13:12:00.000000'),

  (5,  3,  'Blog article writing',
       'High-quality blog articles optimized for search engines, tailored for websites and business blogs.',
       'Writing & Translation', 60.00, 3, 'https://picsum.photos/seed/gig5/600/400', 'active',  '2025-12-28 11:18:00.000000', '2026-02-01 15:50:00.000000'),

  -- paused: tests that paused gigs are excluded from catalog browsing
  (6,  9,  'Social media marketing management',
       'Comprehensive social media strategy and account management to grow brand presence online.',
       'Digital Marketing', 180.00, 7,  'https://picsum.photos/seed/gig6/600/400',  'paused',  '2025-11-07 09:55:00.000000', '2026-01-25 10:30:00.000000'),

  (7,  1,  'Professional PowerPoint presentation design',
       'Visually appealing PowerPoint presentations for business pitches, reports, and academic presentations.',
       'Business', 70.00, 2, 'https://picsum.photos/seed/gig7/600/400',  'active',  '2025-08-14 21:10:00.000000', '2026-02-09 08:40:00.000000'),

  (8,  2,  'Business contract review',
       'Detailed review and feedback for business contracts to ensure clarity and compliance.',
       'Legal', 150.00, 3, 'https://picsum.photos/seed/gig8/600/400',  'active',  '2025-10-02 13:22:00.000000', '2026-02-12 12:15:00.000000'),

  (9,  5,  'Python data analysis and visualization',
       'Data cleaning, statistical analysis, and visualization using Python, Pandas, and Matplotlib.',
       'Data', 140.00, 4, 'https://picsum.photos/seed/gig9/600/400',  'active',  '2025-09-09 06:48:00.000000', '2026-01-30 17:20:00.000000'),

  -- deleted: tests that soft-deleted gigs are excluded from all queries
  (10, 12, 'Personalized fitness and workout planning',
       'Custom workout plans tailored to individual goals, fitness levels, and available equipment.',
       'Lifestyle', 50.00, 2,  'https://picsum.photos/seed/gig10/600/400', 'deleted', '2025-07-21 15:12:00.000000', '2025-12-10 10:00:00.000000')

ON DUPLICATE KEY UPDATE
  freelancer_id  = VALUES(freelancer_id),
  title = VALUES(title),
  description = VALUES(description),
  category = VALUES(category),
  price = VALUES(price),
  delivery_days = VALUES(delivery_days),
  image_url = VALUES(image_url),
  status = VALUES(status),
  updated_at = VALUES(updated_at);
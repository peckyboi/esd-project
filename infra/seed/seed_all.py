import pymysql
import time

def wait_for_db(host, user, password, db):
    while True:
        try:
            conn = pymysql.connect(
                host=host,
                user=user,
                password=password,
                database=db
            )
            conn.close()
            print(f"{host} ready")
            break
        except:
            print(f"Waiting for {host}...")
            time.sleep(5)


def seed_freelance_jobs():
    conn = pymysql.connect(
        host="freelance-job-db",
        user="freelance_job_user",
        password="freelance_job_pass",
        database="freelance_job_db"
    )
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO gigs (
            gig_id, freelancer_id, title, description, category,
            price, delivery_days, image_url, status, created_at, updated_at
        ) VALUES
            (1,1,'Modern minimalist logo design','Professional logo design for startups and businesses.','Graphics & Design',75.00,3,'https://picsum.photos/seed/gig1/600/400','active','2025-11-12 14:35:00','2026-01-10 09:10:00'),
            (2,5,'Responsive React website development','Full responsive website using React and Tailwind.','Programming & Technology',250.00,5,'https://picsum.photos/seed/gig2/600/400','active','2025-12-03 08:42:00','2026-02-05 11:20:00'),
            (3,4,'Professional YouTube video editing','YouTube editing including subtitles and transitions.','Video & Animation',120.00,2,'https://picsum.photos/seed/gig3/600/400','active','2025-10-18 19:05:00','2026-02-11 07:45:00'),
            (4,7,'Music mixing and mastering','Studio-quality audio mixing services.','Music & Audio',95.00,4,'https://picsum.photos/seed/gig4/600/400','active','2025-09-25 16:30:00','2026-01-18 13:12:00'),
            (5,3,'SEO blog article writing','SEO optimized long-form blog content.','Writing & Translation',60.00,3,'https://picsum.photos/seed/gig5/600/400','active','2025-12-28 11:18:00','2026-02-01 15:50:00'),
            (6,9,'Social media marketing management','Full Instagram and TikTok marketing management.','Digital Marketing',180.00,7,'https://picsum.photos/seed/gig6/600/400','paused','2025-11-07 09:55:00','2026-01-25 10:30:00'),
            (7,1,'Professional PowerPoint presentation design','Business presentation design for pitches.','Business',70.00,2,'https://picsum.photos/seed/gig7/600/400','active','2025-08-14 21:10:00','2026-02-09 08:40:00'),
            (8,2,'Business contract review','Legal contract review and suggestions.','Legal',150.00,3,'https://picsum.photos/seed/gig8/600/400','active','2025-10-02 13:22:00','2026-02-12 12:15:00'),
            (9,5,'Python data analysis','Data analysis using Pandas and visualization.','Data',140.00,4,'https://picsum.photos/seed/gig9/600/400','active','2025-09-09 06:48:00','2026-01-30 17:20:00'),
            (10,12,'Fitness training plan','Personalized workout program.','Lifestyle',50.00,2,'https://picsum.photos/seed/gig10/600/400','deleted','2025-07-21 15:12:00','2025-12-10 10:00:00'),
            (11,8,'Mobile app UI design','Modern UI design for iOS and Android apps.','Graphics & Design',220.00,6,'https://picsum.photos/seed/gig11/600/400','active','2025-10-15','2026-02-10'),
            (12,6,'WordPress website setup','Complete WordPress installation and customization.','Programming & Technology',130.00,4,'https://picsum.photos/seed/gig12/600/400','active','2025-11-02','2026-01-15'),
            (13,10,'Podcast editing','Podcast cleanup, EQ and mastering.','Music & Audio',80.00,3,'https://picsum.photos/seed/gig13/600/400','active','2025-12-05','2026-02-02'),
            (14,11,'LinkedIn profile optimization','Professional LinkedIn profile rewrite.','Business',65.00,2,'https://picsum.photos/seed/gig14/600/400','active','2025-12-20','2026-02-12'),
            (15,4,'TikTok video editing','Short-form vertical video editing.','Video & Animation',90.00,1,'https://picsum.photos/seed/gig15/600/400','active','2025-12-28','2026-02-14')
        ON DUPLICATE KEY UPDATE
            freelancer_id = VALUES(freelancer_id),
            title = VALUES(title),
            description = VALUES(description),
            category = VALUES(category),
            price = VALUES(price),
            delivery_days = VALUES(delivery_days),
            image_url = VALUES(image_url),
            status = VALUES(status),
            updated_at = VALUES(updated_at);
    """)
    conn.commit()
    conn.close()
    print("Gigs seeded")


def seed_orders():
    conn = pymysql.connect(
        host="order-db",
        user="order_user",
        password="order_pass",
        database="order_db"
    )
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO orders (
            client_id, freelancer_id, gig_id, price, order_description,
            status, payment_transaction_id, dispute_reason, settlement_amount,
            disputed_at, resolved_at
        ) VALUES
            (1,1,1,75,'Logo design for tech startup','completed','txn_1001',NULL,NULL,NULL,NULL),
            (2,5,2,250,'Build portfolio website','in_progress','txn_1002',NULL,NULL,NULL,NULL),
            (3,4,3,120,'Edit travel vlog','delivered','txn_1003',NULL,NULL,NULL,NULL),
            (4,7,4,95,'Mix and master indie song','completed','txn_1004',NULL,NULL,NULL,NULL),
            (5,3,5,60,'Write SEO blog article','released','txn_1005',NULL,NULL,NULL,NULL),
            (6,9,6,180,'Social media growth strategy','cancelled',NULL,NULL,NULL,NULL,NULL),
            (7,1,7,70,'Design startup pitch deck','payment_failed',NULL,NULL,NULL,NULL,NULL),
            (8,2,8,150,'Review SaaS partnership contract','in_progress','txn_1008',NULL,NULL,NULL,NULL),
            (9,5,9,140,'Analyze ecommerce dataset','disputed','txn_1009','Client claims analysis incorrect',NULL,NOW(),NULL),
            (10,12,10,50,'Custom workout plan','refunded','txn_1010','Client unsatisfied with plan',25.00,NOW(),NOW()),
            (11,8,11,220,'Mobile app UI redesign','pending_payment',NULL,NULL,NULL,NULL,NULL),
            (12,6,12,130,'WordPress blog setup','released','txn_1012',NULL,NULL,NULL,NULL),
            (13,10,13,80,'Podcast editing for marketing podcast','completed','txn_1013',NULL,NULL,NULL,NULL),
            (14,11,14,65,'Optimize LinkedIn profile','completed','txn_1014',NULL,NULL,NULL,NULL),
            (15,4,15,90,'TikTok product promo editing','in_progress','txn_1015',NULL,NULL,NULL,NULL)
    """)
    conn.commit()
    conn.close()
    print("Orders seeded")


def seed_payments():
    conn = pymysql.connect(
        host="payment-db",
        user="payment_user",
        password="payment_pass",
        database="payment_db"
    )
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO payments (
            payment_id, order_id, client_id, freelancer_id, amount,
            status, stripe_payment_intent_id, created_at, updated_at
        ) VALUES
            (1,2,2,3,250.00,'held','pi_test_001','2026-01-13 08:00:00','2026-01-13 08:00:00'),
            (2,3,3,4,120.00,'held','pi_test_002','2026-01-15 14:00:00','2026-01-15 14:00:00'),
            (3,4,1,2,75.00,'released','pi_test_003','2026-01-18 09:00:00','2026-01-20 10:00:00'),
            (4,5,2,3,250.00,'released','pi_test_004','2026-01-20 08:00:00','2026-01-25 09:00:00'),
            (5,7,5,6,60.00,'failed',NULL,'2026-01-25 11:00:00','2026-01-25 11:05:00'),
            (6,8,3,4,120.00,'held','pi_test_005','2026-01-28 09:00:00','2026-02-01 10:00:00'),
            (7,9,4,5,95.00,'refunded','pi_test_006','2026-01-30 10:00:00','2026-02-05 14:00:00'),
            (8,10,5,6,60.00,'released','pi_test_007','2026-02-01 08:00:00','2026-02-08 12:00:00'),
            (9,11,8,8,220,'held','pi_test_009','2026-02-02','2026-02-02'),
            (10,12,6,6,130,'released','pi_test_010','2026-02-04','2026-02-06'),
            (11,13,10,10,80,'released','pi_test_011','2026-02-05','2026-02-06'),
            (12,14,11,11,65,'released','pi_test_012','2026-02-06','2026-02-07'),
            (13,15,4,4,90,'held','pi_test_013','2026-02-08','2026-02-08')
        ON DUPLICATE KEY UPDATE
            order_id = VALUES(order_id),
            client_id = VALUES(client_id),
            freelancer_id = VALUES(freelancer_id),
            amount = VALUES(amount),
            status = VALUES(status),
            stripe_payment_intent_id = VALUES(stripe_payment_intent_id),
            updated_at = VALUES(updated_at);
    """)
    conn.commit()
    conn.close()
    print("Payments seeded")


def seed_reviews():
    conn = pymysql.connect(
        host="review-db",
        user="review_user",
        password="review_pass",
        database="review_db"
    )
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO reviews (
            order_id, gig_id, client_id, freelancer_id, rating,
            message, is_deleted, created_at, updated_at
        ) VALUES
            (4,1,4,1,5,'Excellent work, delivered ahead of schedule.',0,NOW(),NOW()),
            (2,1,9,1,4,'Good work but communication could be improved.',0,NOW(),NOW()),
            (5,2,2,5,4,'Great React site, minor tweaks needed but overall solid.',0,NOW(),NOW()),
            (9,4,4,7,2,'Work did not meet expectations, had to request a refund.',0,NOW(),NOW()),
            (10,5,5,3,3,'Decent work but communication was slow throughout.',0,NOW(),NOW()),
            (3,3,3,4,5,'Video editing was top quality, very happy.',0,NOW(),NOW()),
            (11,11,8,8,5,'Fantastic UI redesign. Highly recommend!',0,NOW(),NOW()),
            (12,12,6,6,4,'WordPress setup was smooth and fast.',0,NOW(),NOW()),
            (13,13,10,10,5,'Podcast audio sounds amazing now.',0,NOW(),NOW()),
            (14,14,11,11,4,'LinkedIn profile looks more professional.',0,NOW(),NOW()),
            (15,15,4,4,3,'Video editing was decent but could improve timing.',0,NOW(),NOW()),
            (5,5,3,3,2,'Content quality not as expected.',1,NOW(),NOW())
        ON DUPLICATE KEY UPDATE
            gig_id = VALUES(gig_id),
            freelancer_id = VALUES(freelancer_id),
            rating = VALUES(rating),
            message = VALUES(message),
            is_deleted = VALUES(is_deleted),
            updated_at = NOW();
    """)
    conn.commit()
    conn.close()
    print("Reviews seeded")


if __name__ == "__main__":
    wait_for_db("freelance-job-db","freelance_job_user","freelance_job_pass","freelance_job_db")
    wait_for_db("order-db","order_user","order_pass","order_db")
    wait_for_db("payment-db","payment_user","payment_pass","payment_db")
    wait_for_db("review-db","review_user","review_pass","review_db")

    seed_freelance_jobs()
    seed_orders()
    seed_payments()
    seed_reviews()

    print("All seeding complete!")
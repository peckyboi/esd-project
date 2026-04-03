import { Text } from "@/components/retroui/Text";
import ReviewCard from "./ReviewCard";


function ReviewList({ reviews = [] }) {
    return (
        <section className="space-y-4">
            <Text as="h2" className="text-xl font-semibold">
                Reviews
            </Text>

            {reviews.length === 0 ? (
                <Text as="p" className="text-muted-foreground">
                    No reviews yet.
                </Text>
            ) : (
                    <div className="space-y-3">
                        {reviews.map((review, index) => (
                            <ReviewCard key={review.order_id ?? index} review={review} />
                        ))}
                    </div>
            )}
        </section>
    );
}

export default ReviewList;
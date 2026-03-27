import { Text } from "@/components/retroui/Text";
import ReviewCard from "./ReviewCard";

const reviews = [
    {
        name: "John D",
        rating: 4,
        text: "Fantastic work! The web app exceeded my expectations.",
        date: "April 2024",
    },
    {
        name: "Pink M",
        rating: 5,
        text: "Excellent!",
        date: "November 2025",
    },
    {
        name: "Azra B",
        rating: 5,
        text: "Marvellous job! The web app is perfect.",
        date: "2 days ago",
    },
];

function ReviewList() {
    return (
        <section className="space-y-4">

            <Text as="h2" className="text-xl font-semibold">
                Reviews
            </Text>

            <div className="space-y-3">
                {reviews.map((review, index) => (
                    <ReviewCard key={index} review={review} />
                ))}
            </div>

        </section>
    );
}

export default ReviewList;
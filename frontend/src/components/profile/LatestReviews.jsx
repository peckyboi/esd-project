import { Card } from "@/components/retroui/Card";
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import { Avatar } from "@/components/retroui/Avatar";

export default function LatestReviews({ reviews, role }) {

    const latest = reviews.slice(0, 2);

    return (
        <Card className="p-4 space-y-4 w-full">

            <div className="flex justify-between items-center">
                <Text className="font-semibold text-lg">
                    {role === "freelancer" ? "Latest Reviews Received" : "Latest Reviews"}
                </Text>

                <Button variant="link" size="sm">
                    View All
                </Button>
            </div>

            <div className="flex flex-col gap-3">

                {latest.map((review) => (

                    role === "customer" ? (

                        <Card key={review.id} className="p-3">
                            <Text className="font-semibold">
                                {review.gigName}
                            </Text>

                            <Text className="text-sm text-gray-500">
                                {review.content}
                            </Text>
                        </Card>

                    ) : (

                        <Card key={review.id} className="p-3">
                            <div className="flex items-center gap-3">

                                <Avatar className="h-15 w-15">
                                    <Avatar.Image alt="reviewer-avatar" />
                                    <Avatar.Fallback>JD</Avatar.Fallback>
                                </Avatar>

                                <div>
                                    <div className="font-medium">
                                        {review.name}
                                    </div>

                                    <div className="text-sm text-gray-500">
                                        {review.date}
                                    </div>
                                    <div>
                                        {"★".repeat(review.rating)}
                                    </div>
                                </div>

                            </div>

                            <Text className="text-sm mt-3">
                                {review.content}
                            </Text>
                        </Card>

                    )

                ))}

            </div>

        </Card>
    );
}
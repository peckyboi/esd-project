import { Text } from "@/components/retroui/Text";
import { Card } from "@/components/retroui/Card";
import { Avatar } from "@/components/retroui/Avatar";

export default function ReviewCard({ review }) {
    const initials = review.client_name?.[0]?.toUpperCase() ?? "?";
    const formattedDate = review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
    : null;

    return (
        <Card className="w-full shadow-none hover:shadow-md">
            <Card.Content>
            <div className="flex items-center space-x-2">
                <Avatar className="h-10 w-10">
                <Avatar.Fallback>{initials}</Avatar.Fallback>
                </Avatar>
                <div>
                <div className="font-medium">
                    {review.client_name ?? "Anonymous"} {"★".repeat(review.rating)}
                        </div>
                        {formattedDate && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {formattedDate}
                            </div>
                        )}
                    </div>
            </div>
            <Text className="text-lg mt-3">{review.message}</Text>
            </Card.Content>
        </Card>
    );
}
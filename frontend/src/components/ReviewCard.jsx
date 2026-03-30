import { Text } from "@/components/retroui/Text";
import { Card } from "@/components/retroui/Card";
import { Avatar } from "@/components/retroui/Avatar";

export default function ReviewCard({ review }) {
    return (
        <Card className="w-full shadow-none hover:shadow-md">
            <Card.Content>
                <div className="flex items-center space-x-2">
                    <Avatar className="h-10 w-10">
                        <Avatar.Image
                            alt="broken-link"
                        />
                        <Avatar.Fallback>JD</Avatar.Fallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{review.name} {"★".repeat(review.rating)}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {review.date}
                        </div>
                    </div>
                </div>
                <Text className="text-lg mt-3">
                    {review.text}
                </Text>
            </Card.Content>
        </Card>
    );
}
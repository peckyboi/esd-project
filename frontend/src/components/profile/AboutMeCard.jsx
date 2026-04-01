import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";

export default function AboutMeCard({ about }) {
    return (
        <Card className="p-4 space-y-2 w-full">
            <Text className="font-semibold text-lg">About Me</Text>
            <Text className="text-gray-600">{about}</Text>
        </Card>
    );
}
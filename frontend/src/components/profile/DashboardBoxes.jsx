import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";

export default function DashboardBoxes({ ordersPlaced, reviewsGiven, activeOrders }) {
    const stats = [
        { label: "Orders Placed", value: ordersPlaced },
        { label: "Reviews Given", value: reviewsGiven },
        { label: "Active Orders", value: activeOrders },
    ];

    return (
        <div className="grid grid-cols-3 gap-4">
            {stats.map((stat) => (
                <Card key={stat.label} className="p-4 text-center">
                    <Text className="text-2xl font-bold">{stat.value}</Text>
                    <Text className="text-gray-500 text-sm">{stat.label}</Text>
                </Card>
            ))}
        </div>
    );
}
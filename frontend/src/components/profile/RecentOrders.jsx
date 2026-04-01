import { Card } from "@/components/retroui/Card";
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";

export default function RecentOrders({ orders }) {
    return (
        <Card className="p-4 space-y-4 w-full">
            <div className="flex justify-between items-center">
                <Text className="font-semibold text-lg">Recent Orders</Text>
                <Button variant="link" size="sm">View All</Button>
            </div>

            <div className="flex flex-col gap-3">
                {orders.slice(0, 2).map((order) => (
                    <Card key={order.id} className="p-3 flex justify-between items-center">
                        <div className="space-y-1">
                            <Text className="font-medium font-semibold">{order.gigName}</Text>

                            <Text className="text-sm text-gray-500">
                                {order.status} • {order.freelancerName}
                            </Text>

                            <Text className="text-sm text-gray-500">
                                ${order.price} • {order.deliveryDays} days
                            </Text>
                        </div>

                        <div className="flex gap-2">
                            <Button size="sm">View Chat</Button>
                            <Button size="sm" variant="outline">View Order</Button>
                        </div>
                    </Card>
                ))}
            </div>
        </Card>
    );
}
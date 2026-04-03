import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
// import StatusBadge from "@/components/StatusBadge"; // Uncomment once available
import { Progress } from "@/components/retroui/Progress";

export default function OrderCard({ order }) {
    let progressValue = 0;
    let progressColor = "bg-yellow-500"; // default in-progress

    switch (order.status) {
        case "in_progress":
            progressValue = 50;
            progressColor = "bg-yellow-500";
            break;
        case "completed":
        case "delivered":
            progressValue = 100;
            progressColor = "bg-green-500";
            break;
        case "disputed":
            progressValue = 100;
            progressColor = "bg-red-500";
            break;
        default:
            progressValue = 0;
            progressColor = "bg-gray-400";
    }

    return (
        <Card className="p-4 relative flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <Text as="h5" className="font-semibold">
                    {order.title}
                </Text>
                {/* <StatusBadge status={order.status} /> */}
            </div>

            <Text className="text-sm font-bold text-muted-foreground">
                {order.freelancer}
            </Text>

            <div className="flex justify-between items-center text-sm">
                <span className="font-semibold">${order.price}</span>
                <span className="text-muted-foreground">
                    {order.deliveryDays} day delivery
                </span>
            </div>

            <Progress value={progressValue} className={`h-2 rounded ${progressColor}`} />

            <div className="flex gap-2 mt-2">
                {order.status === "in_progress" || order.status === "completed" ? (
                    <Button className="flex-1">View Gig</Button>
                ) : order.status === "delivered" ? (
                    <>
                        <Button className="flex-1">Dispute</Button>
                        <Button variant="outline" className="flex-1">
                            Approve Order
                        </Button>
                    </>
                ) : order.status === "disputed" ? (
                    <Button className="flex-1">View Chat</Button>
                ) : null}
            </div>
        </Card>
    );
}
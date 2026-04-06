import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
// import StatusBadge from "@/components/StatusBadge"; // Uncomment once available
import { Progress } from "@/components/retroui/Progress";
import { Loader2 } from "lucide-react";

export default function OrderCard({
    order,
    actorRole,
    onViewGig,
    onDeliver,
    onApprove,
    onDispute,
    onViewChat,
    actionLoading,
}) {
    let progressValue = 0;
    let progressColor = "bg-yellow-500"; // default in-progress

    switch (order.status) {
        case "pending_payment":
            progressValue = 20;
            progressColor = "bg-yellow-500";
            break;
        case "in_progress":
            progressValue = 50;
            progressColor = "bg-yellow-500";
            break;
        case "completed":
        case "delivered":
        case "released":
        case "refunded":
            progressValue = 100;
            progressColor = "bg-green-500";
            break;
        case "disputed":
            progressValue = 100;
            progressColor = "bg-red-500";
            break;
        case "payment_failed":
            progressValue = 100;
            progressColor = "bg-red-500";
            break;
        case "cancelled":
            progressValue = 100;
            progressColor = "bg-red-400";
            break;
        default:
            progressValue = 0;
            progressColor = "bg-gray-400";
    }

    const isBusy = actionLoading === order.id;

    return (
        <Card className="relative flex min-h-[280px] flex-col gap-3 p-4">
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
                    {order.deliveryDays > 0 ? `${order.deliveryDays} day delivery` : "Delivery TBD"}
                </span>
            </div>

            <Progress value={progressValue} className={`h-2 ${progressColor}`} />

            <div className="mt-auto flex gap-2 pt-2">
                {order.status === "delivered" && actorRole === "client" ? (
                    <>
                        <Button className="flex-1" disabled={isBusy} onClick={() => onDispute(order)}>
                            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Dispute"}
                        </Button>
                        <Button variant="outline" className="flex-1" disabled={isBusy} onClick={() => onApprove(order)}>
                            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve Order"}
                        </Button>
                    </>
                ) : order.status === "in_progress" && actorRole === "freelancer" ? (
                    <div className="flex w-full justify-end">
                        <Button className="w-1/2 justify-center" disabled={isBusy} onClick={() => onDeliver(order)}>
                            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark Delivered"}
                        </Button>
                    </div>
                ) : order.status === "disputed" ? (
                    <div className="flex w-full justify-end">
                        <Button className="w-1/2 justify-center" onClick={() => onViewChat(order)}>
                            View Chat
                        </Button>
                    </div>
                ) : (
                    <div className="flex w-full justify-end">
                        <Button className="w-1/2 justify-center" onClick={() => onViewGig(order)}>
                            View Gig
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
}

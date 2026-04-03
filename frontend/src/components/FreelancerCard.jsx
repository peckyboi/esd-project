import { Avatar } from "@/components/retroui/Avatar";
import { Text } from "@/components/retroui/Text";
import { Link } from "react-router-dom";
import { Card } from "@/components/retroui/Card";
import { Badge } from "@/components/retroui/Badge";
const statusLabel = {
    null: null,
    in_progress: "In Progress",
    delivered: "Delivered"
};

function FreelancerCard({ name, avatar, rating, price, delivery_days, category, orderStatus }) {
    return (
        <Card className="w-full rounded-none">
            <Card.Content className="display-grid p-5 space-y-5">
            <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                {avatar ? (
                    <Avatar.Image src={avatar} alt={name} />
                ) : (
                    <Avatar.Fallback>
                    {name?.[0]?.toUpperCase() ?? "?"}
                    </Avatar.Fallback>
                )}
                </Avatar>

                <div>
                <Text as="h4">{name ?? "Unknown"}</Text>

                <Text as="p" className="text-sm text-muted-foreground">
                    {rating} ★ | <Link to="#">View Profile</Link>
                </Text>
                </div>
            </div>
            <div className="space-y-1 text-sm">
                <Text>
                <b>Category:</b> {category ?? "Unknown"}
                </Text>
                <Text>
                <b>Price:</b> ${price?.toFixed(2) ?? "0.00"}
                </Text>
                <Text>
                <b>Delivery:</b> {delivery_days ?? "Unknown"} days
                </Text>
            </div>
            
                {orderStatus && statusLabel[orderStatus] && (
                    <div className="flex items-center gap-3">
                        <Text>Status</Text>
                        <Badge variant="solid" className="rounded-full">
                            {statusLabel[orderStatus] || "Unknown"}
                        </Badge>
                    </div>
                )}
                
            <div className="rounded-md border border-border bg-muted p-3 text-xs text-muted-foreground">
                <Text className="text-xs">
                Secure checkout • 24/7 support • Money-back guarantee
                </Text>
            </div>
            </Card.Content>
        </Card>
    );
}

export default FreelancerCard;
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import StatusBadge from "@/components/StatusBadge";
import { Link } from "react-router-dom";

export default function GigInfoPanel({ gig }) {
    return (
        <aside className="p-3 flex flex-col gap-6 w-80">
            <Link to="/home" className="self-end bg-white">
                <Button variant="outline">← Back to Homepage</Button>
            </Link>

            <Card className="p-5 space-y-3">
                <Text as="h5" className="font-semibold text-lg text-foreground truncate">
                    {gig.title}
                </Text>

                <div className="border-t border-border/50" />

                <div className="flex justify-between text-sm text-muted-foreground">
                    <Text className="truncate">{gig.freelancer}</Text>
                    <Text>${gig.price}</Text>
                    <Text>{gig.deliveryTime}</Text>
                </div>

                <StatusBadge status={gig.status} />

                {gig.statusMessage && (
                    <Text as="p" className="text-xs text-muted-foreground mt-1">
                        {gig.statusMessage}
                    </Text>
                )}
            </Card>

            <Card className="p-4 space-y-3">
                <Text as='h6' className="font-medium font-semibold text-foreground">Actions</Text>
                <Button className="w-full">{gig.actionPrimary}</Button>
                <Button variant="outline" className="w-full">
                    {gig.actionSecondary}
                </Button>
                {gig.actionMessage && (
                    <Text as="p" className="text-xs text-muted-foreground mt-1">
                        {gig.actionMessage}
                    </Text>
                )}
            </Card>
        </aside>
    );
}
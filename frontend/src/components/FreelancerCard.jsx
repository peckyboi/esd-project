import { Avatar } from "@/components/retroui/Avatar";
import { Text } from "@/components/retroui/Text";
import { Link } from "react-router-dom";
import { Card } from "@/components/retroui/Card";
import { Badge } from "@/components/retroui/Badge";

function FreelancerCard() {
    return (
        <Card className="w-full rounded-none">
            <Card.Content className="display-grid p-5 space-y-5">

                <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14">
                        <Avatar.Fallback>A</Avatar.Fallback>
                    </Avatar>

                    <div>
                        <Text as="h4">Alice W</Text>

                        <Text as="p" className="text-sm text-muted-foreground">
                            4.8 ★ |{" "}
                            <Link to="#">
                                View Profile
                            </Link>
                        </Text>
                    </div>
                </div>

                <div className="space-y-1 text-sm">
                    <Text><b>Category:</b> Web Development</Text>
                    <Text><b>Price:</b> $495</Text>
                    <Text><b>Delivery:</b> 2 days</Text>
                </div>

                <div className='flex items-center gap-3'>
                    <Text>Status</Text>
                    <Badge variant="solid" className="rounded-full">
                        In Progress
                    </Badge>
                </div>

                <div className="rounded-md border border-border bg-muted p-3 text-xs text-muted-foreground">
                    <Text className="text-xs">Secure checkout • 24/7 support • Money-back guarantee</Text>
                </div>

            </Card.Content>
        </Card>
    );
}

export default FreelancerCard;
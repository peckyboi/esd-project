import { Avatar } from "@/components/retroui/Avatar";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Badge } from "@/components/retroui/Badge";
import { Button } from "@/components/retroui/Button";
import { Link } from "react-router-dom";

export default function ProfileHeader({ name, role, rating, profilePictureUrl }) {

    const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);

    return (
        <Card className="p-6 w-full">
            <div className="flex items-start gap-6">

                <Avatar src={profilePictureUrl} className="h-24 w-24">
                    <Avatar.Fallback>AH</Avatar.Fallback>
                </Avatar>

                <div className="flex-1">

                    {/* Top row */}
                    <div className="flex items-start justify-between">
                        <Text as="h2" className="text-xl font-semibold">
                            {name}
                        </Text>

                        <Link to="/">
                            <Button variant="outline" size="sm">
                                ← Back to Homepage
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                        <Badge>{formattedRole}</Badge>

                        {role === "freelancer" && (
                            <Text className="text-yellow-500 text-sm">
                                ⭐ {rating} / 5
                            </Text>
                        )}
                    </div>

                </div>
            </div>
        </Card>
    );
}